"use server";

import type { Contact, ContactRole, Prisma } from "@prisma/client";
import type {
  CreateContactSchema,
  UpdateContactSchema,
} from "@/app/(main)/(feature-financials)/validators/contacts";
import { logError } from "@/lib/utils";
import { prisma } from "@/server/prisma";
import type { ActionResponse, Meta } from "@/types/generics";
import type { ContactResponse } from "../types/contacts";

const MESSAGES = {
  CONTACTS: {
    LISTED_SUCCESS: "Contatos listados com sucesso",
    LIST_ERROR: "Erro ao listar contatos",
    CREATED_SUCCESS: "Contato criado com sucesso",
    CREATED_ERROR: "Erro ao criar contato",
    UPDATED_SUCCESS: "Contato atualizado com sucesso",
    UPDATED_ERROR: "Erro ao atualizar contato",
    DELETED_SUCCESS: "Contato excluído com sucesso",
    DELETED_ERROR: "Erro ao excluir contato",
    NOT_FOUND: "Contato não encontrado",
    DOCUMENT_EXISTS: "Já existe um contato com este documento",
    NAME_REQUIRED: "Nome é obrigatório",
  },
} as const;

// Função utilitária para formatar documentos e telefones
const formatNumericField = (value: string | null | undefined): string | null => {
  if (!value?.trim()) return null;
  // Remove todos os caracteres não numéricos
  return value.replace(/\D/g, '');
};

const validateContactExists = async (id: string): Promise<Contact | null> => {
  const contact = await prisma.contact.findUnique({
    where: { id },
  });
  return contact;
};

const validateDocumentUniqueness = async (
  document: string,
  excludeId?: string,
): Promise<boolean> => {
  if (!document?.trim()) return true;

  const where: Prisma.ContactWhereInput = {
    document: document.trim(),
    deletedAt: null,
  };

  if (excludeId) {
    where.id = { not: excludeId };
  }

  const existingContact = await prisma.contact.findFirst({ where });
  return !existingContact;
};

export async function getContacts({
  meta,
  filters,
}: {
  meta: Meta;
  filters?: {
    search?: string;
    roles?: ContactRole[];
  };
}): ActionResponse<{
  contacts: ContactResponse[];
  meta: Meta;
}> {
  try {
    const { page, limit } = meta;

    if (page < 1 || limit < 1) {
      return {
        success: false,
        message: "Parâmetros de paginação inválidos",
      };
    }

    const where: Prisma.ContactWhereInput = {
      deletedAt: null,
    };

    // Aplicar filtros de busca
    if (filters?.search?.trim()) {
      where.OR = [
        { name: { contains: filters.search.trim(), mode: "insensitive" } },
        { document: { contains: filters.search.trim(), mode: "insensitive" } },
        { email: { contains: filters.search.trim(), mode: "insensitive" } },
      ];
    }

    if (filters?.roles?.length) {
      where.roles = {
        hasSome: filters.roles as ContactRole[],
      };
    }

    // Executar consultas em paralelo para melhor performance
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      }),
      prisma.contact.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: MESSAGES.CONTACTS.LISTED_SUCCESS,
      data: {
        contacts: contacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          document: contact.document,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          roles: contact.roles,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
          deletedAt: contact.deletedAt,
        })),
        meta: {
          ...meta,
          total,
          totalPages,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getContacts" });
    return { success: false, message: MESSAGES.CONTACTS.LIST_ERROR };
  }
}

export async function getContactById(id: string): ActionResponse<{
  contact: ContactResponse;
}> {
  try {
    if (!id?.trim()) {
      return { success: false, message: "ID do contato é obrigatório" };
    }

    const contact = await prisma.contact.findUnique({
      where: { id, deletedAt: null },
    });

    if (!contact) {
      return { success: false, message: MESSAGES.CONTACTS.NOT_FOUND };
    }

    return {
      success: true,
      message: "Contato encontrado com sucesso",
      data: {
        contact: {
          id: contact.id,
          name: contact.name,
          document: contact.document,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          roles: contact.roles,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt,
          deletedAt: contact.deletedAt,
        },
      },
    };
  } catch (error) {
    logError({ error, where: "getContactById" });
    return { success: false, message: "Erro ao buscar contato" };
  }
}

export async function createContact(data: CreateContactSchema): ActionResponse<{
  contact: Contact;
}> {
  try {
    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.CONTACTS.NAME_REQUIRED };
    }

    // Formatar campos numéricos
    const formattedDocument = formatNumericField(data.document);
    const formattedPhone = formatNumericField(data.phone);

    // Validar unicidade do documento se fornecido
    if (formattedDocument) {
      const documentExists = await validateDocumentUniqueness(formattedDocument);
      if (!documentExists) {
        return { success: false, message: MESSAGES.CONTACTS.DOCUMENT_EXISTS };
      }
    }

    // Verificar se existe contato deletado com o mesmo documento
    if (formattedDocument) {
      const existingDeletedContact = await prisma.contact.findFirst({
        where: {
          document: formattedDocument,
          deletedAt: { not: null },
        },
      });

      if (existingDeletedContact) {
        // Restaurar contato deletado
        const contact = await prisma.contact.update({
          where: { id: existingDeletedContact.id },
          data: {
            deletedAt: null,
            name: data.name.trim(),
            document: formattedDocument,
            email: data.email?.trim() || null,
            phone: formattedPhone,
            address: data.address?.trim() || null,
            roles: data.roles,
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          message: MESSAGES.CONTACTS.UPDATED_SUCCESS,
          data: { contact },
        };
      }
    }

    // Criar novo contato
    const contact = await prisma.contact.create({
      data: {
        name: data.name.trim(),
        document: formattedDocument,
        email: data.email?.trim() || null,
        phone: formattedPhone,
        address: data.address?.trim() || null,
        roles: data.roles,
      },
    });

    return {
      success: true,
      message: MESSAGES.CONTACTS.CREATED_SUCCESS,
      data: { contact },
    };
  } catch (error) {
    logError({ error, where: "createContact" });
    return { success: false, message: MESSAGES.CONTACTS.CREATED_ERROR };
  }
}

export async function updateContact(data: UpdateContactSchema): ActionResponse<{
  contact: Contact;
}> {
  try {
    // Validações
    if (!data.id.trim()) {
      return { success: false, message: "ID do contato é obrigatório" };
    }

    if (!data.name?.trim()) {
      return { success: false, message: MESSAGES.CONTACTS.NAME_REQUIRED };
    }

    // Verificar se o contato existe
    const existingContact = await validateContactExists(data.id);
    if (!existingContact) {
      return { success: false, message: MESSAGES.CONTACTS.NOT_FOUND };
    }

    // Formatar campos numéricos
    const formattedDocument = formatNumericField(data.document);
    const formattedPhone = formatNumericField(data.phone);

    // Validar unicidade do documento se fornecido
    if (formattedDocument) {
      const documentExists = await validateDocumentUniqueness(
        formattedDocument,
        data.id,
      );
      if (!documentExists) {
        return { success: false, message: MESSAGES.CONTACTS.DOCUMENT_EXISTS };
      }
    }

    const contact = await prisma.contact.update({
      where: { id: data.id },
      data: {
        name: data.name.trim(),
        document: formattedDocument,
        email: data.email?.trim() || null,
        phone: formattedPhone,
        address: data.address?.trim() || null,
        roles: data.roles,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.CONTACTS.UPDATED_SUCCESS,
      data: { contact },
    };
  } catch (error) {
    logError({ error, where: "updateContact" });
    return { success: false, message: MESSAGES.CONTACTS.UPDATED_ERROR };
  }
}

export async function deleteContact(id: string): ActionResponse<{
  contact: Contact;
}> {
  try {
    // Validação
    if (!id?.trim()) {
      return { success: false, message: "ID do contato é obrigatório" };
    }

    // Verificar se o contato existe
    const existingContact = await validateContactExists(id);
    if (!existingContact) {
      return { success: false, message: MESSAGES.CONTACTS.NOT_FOUND };
    }

    // Verificar se já está deletado
    if (existingContact.deletedAt) {
      return { success: false, message: "Contato já foi excluído" };
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: MESSAGES.CONTACTS.DELETED_SUCCESS,
      data: { contact },
    };
  } catch (error) {
    logError({ error, where: "deleteContact" });
    return { success: false, message: MESSAGES.CONTACTS.DELETED_ERROR };
  }
}
