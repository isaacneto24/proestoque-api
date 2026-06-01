import "dotenv/config";
import { app } from "./app";
import { prisma } from "./prisma/client";

const PORT = Number(process.env.PORT ?? 3333);

async function start() {
  try {
    await prisma.$connect();
    console.log("Banco de dados conectado.");

    app.listen(PORT, () => {
      console.log(`ProEstoque API rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

void start();
