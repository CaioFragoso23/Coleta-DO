import { DiarioOficialService } from "./services/DOScraperService.js";
import { RelatorioDOService } from "./services/RelatorioDOService.js";

async function main() {
  // Teste para Pegar documento mais recente do Diário Oficial
  const url = "https://doweb.rio.rj.gov.br/";
  const revistaService = new DiarioOficialService(url);

  const pdfPath = await revistaService.get_revista_diaria();

  if (pdfPath) {
    // Teste para leitura do PDF
    const relatorioDO = new RelatorioDOService(pdfPath);

    const txtPath = await relatorioDO.get_pdf_text();
    if (txtPath) {
      relatorioDO.get_cglf(txtPath);
    }
    await revistaService.delete_revista_diaria();
  }
}

main();
