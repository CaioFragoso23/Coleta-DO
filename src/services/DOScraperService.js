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
    let fileFound = false;
    let filePath = null;
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

      //const timeout = Date.now() + 20000;
      //while (!fileFound && Date.now() < timeout)
      while (!fileFound) {
        const files = fs.readdirSync(downloadPath);
        const pdfFile = files.find(
          (f) => f.endsWith(".pdf") && !f.endsWith(".crdownload")
        );
        if (pdfFile) {
          console.log("Arquivo detectado na pasta de download!", pdfFile);
          while(!fs.existsSync(path.join(downloadPath, pdfFile))){
            await new Promise((r) => setTimeout(r, 500));
          }
          fileFound = true;
          filePath = path.join(downloadPath, pdfFile);
        }
        if (!fileFound) await new Promise((r) => setTimeout(r, 500));
      }
      if (fileFound) {
        console.log("Arquivo detectado na pasta de download!", filePath);
        return filePath;
      } else {
        console.log("Arquivo não encontrado após 20 segundos.");
      }
    } catch (error) {
      console.error("Erro ao fazer o scraping:", error);
    } finally {
      // 5. Fechar o navegador
      await browser.close();
      return filePath;
    }
  }

  async delete_revista_diaria() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const downloadPath = path.resolve(__dirname, "../utils");
    try {
      const file = fs.readdirSync(downloadPath);
      const pdfFile = file.find((f) => f.endsWith(".pdf"));
      if (pdfFile) {
        try {
          await fs.unlinkSync(path.join(downloadPath, pdfFile));
          console.log("Arquivo deletado com sucesso!");
        } catch (error) {
          console.log("Erro ao deletar o arquivo", error);
        }
      }
    } catch (error) {
      console.log("Erro ao encontrar o arquivo", error);
    }
  }
}
