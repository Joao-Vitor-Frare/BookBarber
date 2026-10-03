-- BookBarber - schema inicial PostgreSQL/Supabase

CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL DEFAULT '',
    "senhaHash" TEXT NOT NULL,
    "perfil" TEXT NOT NULL DEFAULT 'CLIENTE',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Barbeiro" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Barbeiro_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Servico" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "precoCentavos" INTEGER NOT NULL,
    "duracaoMinutos" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Produto" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "precoCentavos" INTEGER NOT NULL,
    "imagem" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Configuracao" (
    "id" INTEGER NOT NULL,
    "nomeBanner" TEXT NOT NULL,
    "descBanner" TEXT NOT NULL,
    "imagensBannerJson" TEXT NOT NULL,
    "horariosSemanaJson" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "instagram" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Agendamento" (
    "id" SERIAL NOT NULL,
    "data" TEXT NOT NULL,
    "hora" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AGENDADO',
    "observacoes" TEXT,
    "clienteId" INTEGER NOT NULL,
    "barbeiroId" INTEGER NOT NULL,
    "servicoId" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");
CREATE INDEX "Agendamento_data_idx" ON "Agendamento"("data");
CREATE INDEX "Agendamento_data_hora_idx" ON "Agendamento"("data", "hora");
CREATE INDEX "Agendamento_barbeiroId_data_hora_idx" ON "Agendamento"("barbeiroId", "data", "hora");
CREATE INDEX "Agendamento_clienteId_idx" ON "Agendamento"("clienteId");

ALTER TABLE "Agendamento"
ADD CONSTRAINT "Agendamento_clienteId_fkey"
FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Agendamento"
ADD CONSTRAINT "Agendamento_barbeiroId_fkey"
FOREIGN KEY ("barbeiroId") REFERENCES "Barbeiro"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Agendamento"
ADD CONSTRAINT "Agendamento_servicoId_fkey"
FOREIGN KEY ("servicoId") REFERENCES "Servico"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
