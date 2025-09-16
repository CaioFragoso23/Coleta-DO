import { DiarioOficialService } from "./services/DOScraperService.js";

const url = "https://doweb.rio.rj.gov.br/";
const Revista = new DiarioOficialService(url);

await Revista.get_revista_diaria();
