import puppeteer from "puppeteer";
import { DiarioOficial } from "../models/DOScraper.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

export class DiarioOficialService extends DiarioOficial {
  // Método para fazer download da Revista do Diário Oficial
  async get_revista_diaria() {
    // Abre o navegardor
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    console.log("Abriu nova aba");
    try {
      // 1. Navegar para a URL do livro
      await page.goto(this.url, { waitUntil: "networkidle2" });

      // 2. Esperar por um seletor específico
      // Isso garante que a página carregou o conteúdo que precisamos
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const downloadPath = path.resolve(__dirname, "../utils");
      await page.waitForSelector("#imagemCapa");
      console.log("Achou imagem de capa");
      // 3. Clica na imagem da capa da revista (faz o download da revista completa do dia)

      const client = await page.createCDPSession();
      client.send("Page.setDownloadBehavior", {
        behavior: "allow",
        downloadPath: downloadPath,
      });

      await page.click("#imagemCapa"), // some button that triggers file selection
        console.log("Download iniciado. Verifique a pasta:", downloadPath);

      // Aguarde o download terminar (opcional: aguarde alguns segundos)
      let fileFound = false;
      const timeout = Date.now() + 20000;
      while (!fileFound && Date.now() < timeout) {
        const files = fs.readdirSync(downloadPath);
        fileFound = files.length > 0;
        if (!fileFound) await new Promise((r) => setTimeout(r, 500));
      }
      if (fileFound) {
        console.log("Arquivo detectado na pasta de download!");
      } else {
        console.log("Arquivo não encontrado após 20 segundos.");
      }
    } catch (error) {
      console.error("Erro ao fazer o scraping:", error);
    } finally {
      // 5. Fechar o navegador
      await browser.close();
    }
  }
}
