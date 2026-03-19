import { DOExport } from "../models/DOExport.js";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const XLSX = require("xlsx");
//import * as XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";
export class DOExportService extends DOExport {
  desserializingTxt() {
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
        /(EIS-PRO-[\d\/]+)\s+-\s+(.+?)\s+Extraída Notificação número\s+([\d\/]+)\s+Endereço do imóvel:\s+([\s\S]+?)(?=EIS-PRO|$|Diário Oficial)/g;

      while ((match = regex.exec(limpaLinhas)) !== null) {
        dadosExtraidos.processos.push({
          processo: match[1].trim(),
          entidade: match[2].trim(),
          notificacao: match[3].trim(),
          endereco: match[4].trim().replace(/\s+/g, " "),
        });
      }
      console.log(dadosExtraidos);
      this.DOJSON = dadosExtraidos;
    }
  }

  async buscaCep(endereco) {
    try {
      // Limpa o endereço para pegar apenas o logradouro (remove nº e complementos)
      // Ex: "RUA ABADE RAMOS nº 26" -> "RUA ABADE RAMOS"
      let logradouro = endereco.split("nº")[0].trim();
      logradouro = logradouro.split(",")[0].trim();

      // Busca na API do ViaCEP (RJ/Rio de Janeiro é fixo conforme contexto)
      const url = `https://viacep.com.br/ws/RJ/Rio%20de%20Janeiro/${encodeURIComponent(
        logradouro,
      )}/json/`;

      const response = await fetch(url);
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        // Retorna o primeiro resultado encontrado
        return data[0];
      }
      return null;
    } catch (error) {
      console.log(`Erro ao buscar CEP para ${endereco}:`, error.message);
      return null;
    }
  }

  async JSONToExcel() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const downloadPath = path.resolve(__dirname, "../utils");

    let excelFile;
    // Aguarda o arquivo .xlsx aparecer no diretório
    while (!excelFile) {
      const files = fs.readdirSync(downloadPath);
      excelFile = files.find((f) => f.endsWith(".xlsx"));
      await new Promise((r) => setTimeout(r, 500));
    }
    if (excelFile) {
      const filePath = path.join(downloadPath, excelFile);
      let excel;
      try {
        // Garante que o arquivo esteja acessível para leitura
        while (true) {
          try {
            fs.accessSync(filePath, fs.constants.R_OK);
            break;
          } catch (e) {
            await new Promise((r) => setTimeout(r, 500));
          }
        }

        excel = XLSX.readFile(filePath);
        let sheets = excel.SheetNames[0];

        let abaExcel = excel.Sheets[sheets];
        let dadosExcel = XLSX.utils.sheet_to_json(abaExcel);

        const maxId = dadosExcel.reduce(
          (max, row) => (row.CÓDIGO > max ? row.CÓDIGO : max),
          0,
        );
        let processoID = maxId + 2;

        // let dadosParaExcel = [];
        let dadosParaExcel = [];
        for (const processo of this.DOJSON.processos) {
          processo.codigo = processoID;
          processoID = processoID + 2;

          const dadosCep = await this.buscaCep(processo.endereco);
          const cep = dadosCep ? dadosCep.cep : "";

          const entries = Object.entries(processo);
          const ultimo = entries.pop();
          entries.unshift(ultimo);

          processo.CÓDIGO = processo.codigo;
          // delete processo.codigo;

          const newProcesso = {
            CÓDIGO: processo.codigo,
            "NOME DO CONDOMINIO": processo.entidade,
            ENDEREÇO: processo.endereco,
            BAIRRO: processo.bairro,
            CEP: cep,
            PROCESSO: processo.processo,
            PÁGINA: "",
            "DIA CARTA": new Date().toLocaleDateString("pt-BR"),
            "Dia D.O": this.DOJSON.expediente,
          };

          dadosParaExcel.push(newProcesso);
        }

        this.EXCELJSON.processos = dadosParaExcel;
        // Adiciona os novos dados à planilha existente
        XLSX.utils.sheet_add_json(abaExcel, this.EXCELJSON.processos, {
          skipHeader: true,
          origin: -1,
        });
        XLSX.writeFile(excel, filePath);
        console.log("Arquivo Excel atualizado com sucesso!");
      } catch (error) {
        console.error("Erro ao manipular o arquivo Excel:", error);
      }
    }
  }
}
