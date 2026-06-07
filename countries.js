/*
 * Mapeamento dos nomes de países usados pela fonte de dados (openfootball, em inglês)
 * para o nome em português + código ISO usado para buscar a bandeira no flagcdn.com.
 * Inglaterra e Escócia usam códigos de subdivisão do Reino Unido (gb-eng / gb-sct).
 */
var COUNTRIES = {
  "Algeria":               { pt: "Argélia",                iso: "dz" },
  "Argentina":             { pt: "Argentina",              iso: "ar" },
  "Australia":             { pt: "Austrália",              iso: "au" },
  "Austria":               { pt: "Áustria",                iso: "at" },
  "Belgium":               { pt: "Bélgica",                iso: "be" },
  "Bosnia & Herzegovina":  { pt: "Bósnia e Herzegovina",   iso: "ba" },
  "Brazil":                { pt: "Brasil",                 iso: "br" },
  "Canada":                { pt: "Canadá",                 iso: "ca" },
  "Cape Verde":            { pt: "Cabo Verde",             iso: "cv" },
  "Colombia":              { pt: "Colômbia",               iso: "co" },
  "Croatia":               { pt: "Croácia",                iso: "hr" },
  "Curaçao":               { pt: "Curaçao",                iso: "cw" },
  "Czech Republic":        { pt: "República Tcheca",       iso: "cz" },
  "DR Congo":              { pt: "RD Congo",               iso: "cd" },
  "Ecuador":               { pt: "Equador",                iso: "ec" },
  "Egypt":                 { pt: "Egito",                  iso: "eg" },
  "England":               { pt: "Inglaterra",             iso: "gb-eng" },
  "France":                { pt: "França",                 iso: "fr" },
  "Germany":               { pt: "Alemanha",               iso: "de" },
  "Ghana":                 { pt: "Gana",                   iso: "gh" },
  "Haiti":                 { pt: "Haiti",                  iso: "ht" },
  "Iran":                  { pt: "Irã",                    iso: "ir" },
  "Iraq":                  { pt: "Iraque",                 iso: "iq" },
  "Ivory Coast":           { pt: "Costa do Marfim",        iso: "ci" },
  "Japan":                 { pt: "Japão",                  iso: "jp" },
  "Jordan":                { pt: "Jordânia",               iso: "jo" },
  "Mexico":                { pt: "México",                 iso: "mx" },
  "Morocco":               { pt: "Marrocos",               iso: "ma" },
  "Netherlands":           { pt: "Países Baixos",          iso: "nl" },
  "New Zealand":           { pt: "Nova Zelândia",          iso: "nz" },
  "Norway":                { pt: "Noruega",                iso: "no" },
  "Panama":                { pt: "Panamá",                 iso: "pa" },
  "Paraguay":              { pt: "Paraguai",               iso: "py" },
  "Portugal":              { pt: "Portugal",               iso: "pt" },
  "Qatar":                 { pt: "Catar",                  iso: "qa" },
  "Saudi Arabia":          { pt: "Arábia Saudita",         iso: "sa" },
  "Scotland":              { pt: "Escócia",                iso: "gb-sct" },
  "Senegal":               { pt: "Senegal",                iso: "sn" },
  "South Africa":          { pt: "África do Sul",          iso: "za" },
  "South Korea":           { pt: "Coreia do Sul",          iso: "kr" },
  "Spain":                 { pt: "Espanha",                iso: "es" },
  "Sweden":                { pt: "Suécia",                 iso: "se" },
  "Switzerland":           { pt: "Suíça",                  iso: "ch" },
  "Tunisia":               { pt: "Tunísia",                iso: "tn" },
  "Turkey":                { pt: "Turquia",                iso: "tr" },
  "Uruguay":               { pt: "Uruguai",                iso: "uy" },
  "USA":                   { pt: "Estados Unidos",         iso: "us" },
  "Uzbekistan":            { pt: "Uzbequistão",            iso: "uz" }
};

if (typeof module !== "undefined" && module.exports) { module.exports = COUNTRIES; }
if (typeof window !== "undefined") { window.COUNTRIES = COUNTRIES; }
