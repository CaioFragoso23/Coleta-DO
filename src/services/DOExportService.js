import { DOExport } from "../models/DOExport.js";
import fs from "fs";
export class DOExportService extends DOExport {
  async desserializingTxt() {
    let textoExtraido = fs.readFileSync(this.file, "utf-8", (err, data) => {
      if (err) {
        console.log("Erro ao ler o arquivo:");
      } else {
        console.log("Arquivo Encontrado", data);
      }
    });
    if (typeof textoExtraido === "string") {
      /********************************************************************   
      Desserializando os dados do TXT para transformar em JSON
      *********************************************************************/
      let dadosExtraidos = {};
      let dadosProcessos = [];
      let match;
      dadosExtraidos.processos = dadosProcessos;

      /*Extraindo expediente do documento*/
      const regexExpediente = /EXPEDIENTE DE\s+([\d\/]+)/i;
      const matchExpediente = textoExtraido.match(regexExpediente);

      dadosExtraidos.expediente = matchExpediente
        ? matchExpediente[1].trim()
        : "";

      const limpaLinhas = textoExtraido.replace(/\//g, "");

      /*Extraindo processos*/
      const regex =
        /(EIS-PRO-[\d\/]+)\s+-\s+(.+?)\s+Extraída Notificação número\s+([\d\/]+)\s+Endereço do imóvel:\s+([\s\S]+?)(?=\nEIS-PRO|$|Diário Oficial)/g;

      while ((match = regex.exec(limpaLinhas)) !== null) {
        dadosExtraidos.processos.push({
          processo: match[1].trim(),
          entidade: match[2].trim(),
          notificacao: match[3].trim(),
          endereco: match[4].trim().replace(/\s+/g, " "),
        });
      }
      console.log(dadosExtraidos);
    }
  }
}
