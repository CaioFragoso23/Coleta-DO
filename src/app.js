import { DiarioOficialService } from "./services/DOScraperService.js";
import { RelatorioDOService } from "./services/RelatorioDOService.js";

// Teste para Pegar documento mais recente do Diário Oficial
/* 
const url = "https://doweb.rio.rj.gov.br/";
const Revista = new DiarioOficialService(url);

await Revista.get_revista_diaria(); */

// Teste para leitura do PDF

const relatorioDO = new RelatorioDOService(
  "./src/utils/rio_de_janeiro_2025-09-15_completo.pdf"
);

/* console.log("texto");
relatorioDO.get_pdf_text();

console.log("\n info");
relatorioDO.get_pdf_info();

console.log("\n paginas");
relatorioDO.get_pdf_numpages(); */

relatorioDO.get_cglf();