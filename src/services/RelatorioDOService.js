import { RelatorioDO } from "../models/RelatorioDO.js";
import fs from "fs";
import PDF from "pdf-parse";

function render_page(pageData, ret) {
  //check documents https://mozilla.github.io/pdf.js/
  ret.text = ret.text ? ret.text : "";

  let render_options = {
    //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
    normalizeWhitespace: true,
    //do not attempt to combine same line TextItem's. The default value is `false`.
    disableCombineTextItems: false,
  };

  return pageData.getTextContent(render_options).then(function (textContent) {
    let strings = textContent.items.map((item) => item.str);
    let text = strings.join(" ");
    ret.text = `${ret.text} ${text} \n\n`;
  });
}

let options = {
  pagerender: render_page,
};

export class RelatorioDOService extends RelatorioDO {
  /*   test() {
    PDF(dataBuffer).then(function (data) {
      // number of pages
      console.log(data.numpages);

      // number of rendered pages
      console.log(data.numrender);

      // PDF info
      console.log(data.info);

      // PDF metadata
      console.log(data.metadata);

      // PDF.js version
      // check https://mozilla.github.io/pdf.js/getting_started/
      console.log(data.version);

      // PDF text
      console.log(data.text);
    });
  } */

  get_pdf_info() {
    const dataBuffer = fs.readFileSync(this.file);
    PDF(dataBuffer).then(function (data) {
      console.log(data.info);
    });
  }

  get_pdf_numpages() {
    const dataBuffer = fs.readFileSync(this.file);
    PDF(dataBuffer).then(function (data) {
      console.log(data.numpages);
    });
  }

  async get_pdf_text() {
    try {
      console.log(`Arquivo é ${this.file}`);
      while (!fs.existsSync(this.file)) {
        await new Promise((r) => setTimeout(r, 500));
      }
      const dataBuffer = fs.readFileSync(this.file);
      const txtPath = this.file.replace(".pdf", ".txt");
      console.log(`Caminho Novo Arquivo é ${txtPath}`);
      PDF(dataBuffer).then(function (data) {
        fs.writeFileSync(txtPath, data.text);
      });
      console.log("Arquivo de texto gerado:", txtPath);
      return txtPath;
    } catch (error) {
      console.error("Erro ao extrair texto do PDF:", error);
      return null;
    }
  }

  get_cglf(txtPath) {
    let textoCompleto = fs.readFileSync(txtPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }
      console.log("file content", data);
    });
    if (typeof textoCompleto === "string") {
      const inicioBusca = "SUBGERÊNCIA DE FISCALIZAÇÃO DE MANUTENÇÃO PREDIAL";
      const fimBusca = "SUBSECRETARIA DE CONTROLE E LICENCIAMENTO AMBIENTAL";

      let indiceInicioPai = textoCompleto.indexOf(inicioBusca);
      let indiceFim = textoCompleto.indexOf(fimBusca);
      let dadosExtraidos;

      dadosExtraidos = textoCompleto
        .substring(indiceInicioPai, indiceFim)
        .trim();

      const pathDadosExtraidos = txtPath.replace(".txt", "_extraido.txt");
      fs.writeFileSync(pathDadosExtraidos, dadosExtraidos);
      console.log("Arquivo de texto gerado:", pathDadosExtraidos);
      return pathDadosExtraidos;
    }
  }
}
