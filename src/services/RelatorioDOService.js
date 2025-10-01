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

let dataBuffer = fs.readFileSync(
  "C:/Users/Solange/Desktop/Projetos/DiarioOficialScraper/src/utils/rio_de_janeiro_2025-09-15_completo.pdf"
);

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
    PDF(dataBuffer).then(function (data) {
      console.log(data.info);
    });
  }

  get_pdf_numpages() {
    PDF(dataBuffer).then(function (data) {
      console.log(data.numpages);
    });
  }

  get_pdf_text() {
    PDF(dataBuffer).then(function (data) {
      /* console.log(data.text); */
      data.text;
      fs.writeFileSync(
        "C:/Users/Solange/Desktop/Projetos/DiarioOficialScraper/src/utils/rio_de_janeiro_2025-09-15_completo.txt"
      );
      /* return data.text; */
    });
  }

  get_cglf() {
    let textoCompleto = fs.readFileSync(
      "C:/Users/Solange/Desktop/Projetos/DiarioOficialScraper/src/utils/rio_de_janeiro_2025-09-15_completo.txt",
      "utf8",
      (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }
        console.log("file content", data);
      }
    );
    if (typeof textoCompleto === "string") {
      const inicioBusca = "SUBGERÊNCIA DE FISCALIZAÇÃO DE MANUTENÇÃO PREDIAL";
      const fimBusca = "SUBSECRETARIA DE CONTROLE E LICENCIAMENTO AMBIENTAL";

      let indiceInicioPai = textoCompleto.indexOf(inicioBusca);
      let indiceFim = textoCompleto.indexOf(fimBusca);
      let dadosExtraidos;

      dadosExtraidos = textoCompleto
        .substring(indiceInicioPai, indiceFim)
        .trim();
      console.log(dadosExtraidos);
    }
  }
}
