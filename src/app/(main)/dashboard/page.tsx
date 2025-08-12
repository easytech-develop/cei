import { BarChart3, FileText, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-foreground">
					Customer Journeys
				</h1>
				<p className="text-muted-foreground">
					Gerencie e acompanhe as jornadas dos seus clientes
				</p>
			</div>

			{/* Seção de Gerenciamento de Casos */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-foreground">
					New Case Management
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Casos Ativos
							</CardTitle>
							<Users className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">1,234</div>
							<p className="text-xs text-muted-foreground">
								+20.1% em relação ao mês passado
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Documentos</CardTitle>
							<FileText className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">5,678</div>
							<p className="text-xs text-muted-foreground">
								+12.5% em relação ao mês passado
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">Relatórios</CardTitle>
							<BarChart3 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">89</div>
							<p className="text-xs text-muted-foreground">
								+5.2% em relação ao mês passado
							</p>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Seção de Conhecimento Sugerido */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-foreground">
					Suggested Knowledge
				</h2>
				<Card>
					<CardHeader>
						<CardTitle>Base de Conhecimento</CardTitle>
						<CardDescription>
							Artigos e recursos sugeridos com base na sua atividade
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									<div>
										<p className="font-medium">Como configurar autenticação</p>
										<p className="text-sm text-muted-foreground">
											Guia completo de configuração
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Badge variant="secondary">Ativo</Badge>
									<span className="text-sm text-muted-foreground">
										2 dias atrás
									</span>
								</div>
							</div>

							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
									<div>
										<p className="font-medium">
											Melhores práticas de segurança
										</p>
										<p className="text-sm text-muted-foreground">
											Recomendações importantes
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Badge variant="outline">Pendente</Badge>
									<span className="text-sm text-muted-foreground">
										1 semana atrás
									</span>
								</div>
							</div>

							<div className="flex items-center justify-between p-3 border rounded-lg">
								<div className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<div>
										<p className="font-medium">Integração com APIs externas</p>
										<p className="text-sm text-muted-foreground">
											Tutorial passo a passo
										</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<Badge variant="secondary">Ativo</Badge>
									<span className="text-sm text-muted-foreground">
										3 dias atrás
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Seção de Métricas */}
			<div className="space-y-4">
				<h2 className="text-xl font-semibold text-foreground">
					Métricas de Performance
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center space-x-2">
								<TrendingUp className="h-5 w-5" />
								<span>Crescimento</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm">Usuários Ativos</span>
									<span className="text-sm font-medium">+15.3%</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">Engajamento</span>
									<span className="text-sm font-medium">+8.7%</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm">Retenção</span>
									<span className="text-sm font-medium">+12.1%</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Atividades Recentes</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-green-500 rounded-full"></div>
									<span className="text-sm">Novo usuário registrado</span>
									<span className="text-xs text-muted-foreground ml-auto">
										2 min
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-blue-500 rounded-full"></div>
									<span className="text-sm">Documento atualizado</span>
									<span className="text-xs text-muted-foreground ml-auto">
										15 min
									</span>
								</div>
								<div className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
									<span className="text-sm">Relatório gerado</span>
									<span className="text-xs text-muted-foreground ml-auto">
										1 hora
									</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
