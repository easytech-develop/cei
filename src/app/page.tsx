"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/hooks";

export default function Home() {
  const { session, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Você não está autenticado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Bem-vindo ao CEI
            </h1>
            <Button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              variant="outline"
            >
              Sair
            </Button>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Informações do Usuário
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-medium text-gray-600">
                    Nome
                  </span>
                  <p className="text-gray-900">{session?.user?.name}</p>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-600">
                    Email
                  </span>
                  <p className="text-gray-900">{session?.user?.email}</p>
                </div>
                <div>
                  <span className="block text-sm font-medium text-gray-600">
                    Status
                  </span>
                  <p className="text-gray-900">{session?.user?.status}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Sistema de Gestão
              </h2>
              <p className="text-gray-600">
                Sistema interno para gestão de despesas e controle financeiro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
