let activeAction = null;
let activeShift = 'manhã';
let sortAlphabetically = false;
// let selectedDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD 
let selectedDate = "2025-08-31";
// 2025-08-31
let dataByDateAndShift = {}; // Estrutura: { "2024-01-15": { manhã: [], tarde: [], noite: [] } }

// Variáveis para seleção múltipla de chaves
let selectedKeys = [];
let multipleSelectionMode = false;
let currentKeyMode = null; // 'single' ou 'multiple'

// Mapa de docentes para CODPROF (DOCENTE -> CODPROF)
let docentesCodprof = {
    "Adalberto da Silva Correia": "FATS1578",
    "Adeildo Apolonio da Silva Junior": "FATS4451",
    "Aderlan dos Santos": "NORTE233",
    "Adilson Alexandre Amorim": "CALC1227",
    "Adjalbas de Oliveira Santos": "FATS3070",
    "Adriana Bitencourt Bezerra": "FATS5014",
    "Adriana Freitas de Moura": "FATS4312",
    "Adriane do Nascimento Apostolo": "FATS5071",
    "Adrianne Bastos Ferreira": "FATS5189",
    "Adriano Santos de Araujo": "FATS5049",
    "Adriel Rasslan da Silva Gama": "FATS4758",
    "Adson Aragão Carvalho": "FATS4656",
    "Agnelo Souto de Jesus Filho": "FATS1673",
    "Aislan da Silva Souza": "FATS4277",
    "Alberto César Queiroz Fonseca": "ALA265",
    "Alberto Luís Santos e Santos": "AUT0087",
    "Alcígledes de Jesus Sales": "FATS4977",
    "Aldivan Fernandes Conceição Moura Junior": "FATS4990",
    "Alessandra Knoll": "043EAD",
    "Alex Almeida de Souza": "FATS7899",
    "Alex Ferreira": "ALF767",
    "Alexandre da Silva Nogueira": "FATS999109",
    "Alexandre Hartkopf Cardozo": "EAD098",
    "Alexandre Jose Guerra Praia": "ATO074",
    "Alexandre Morais Barbosa": "FATS2399",
    "Alexsandra Alves de Macedo Aquino": "CALC1154",
    "Alexsandra Zaparoli": "FATS022",
    "Aline de Andrade Bonifácio": "EAD010",
    "Aline de Cerqueira dos Santos": "FATS5010",
    "Alisson Cleisson Carvalho Silva": "FATS5060",
    "Allan Jackson Alves da Silva": "FATS3546",
    "Alvaro Tadeu Paes Fiuza Filho": "FATS4732",
    "Amanda de Almeida Santana": "FATS4819",
    "Amanda Moreira Santiago Pereira": "FATS5158",
    "ANA CARMEM CASTRO LEITE": "ALA0163",
    "Ana Carolina Rabêlo Nonato": "FATS4280",
    "Ana Caroline Neves da Silva": "ALA0171",
    "Ana Cláudia de Almeida Gomes Galiza": "FATS4959",
    "Ana Karine Ferreira Bastos Vidal": "FATS4725",
    "Ana Marcia dos Santos Silva": "FATS4112",
    "Ana Paula Farias Goulart": "EAD739",
    "Ana Paula Pereira Lima": "CAM 251",
    "Anderson Batista Córdova": "FATS3124",
    "Anderson Bismark Porto e Silva": "FATS5047",
    "Anderson Emanuel Oliveira Daltro": "FATS4103",
    "Anderson Leandro da Silva Pita": "FATS5108",
    "Anderson Marcos Santos Lobo": "FATS4984",
    "André Luis Pinho Braga": "FATS5194",
    "André Luís Rocha Reis": "ALA0178",
    "André Luiz Gomes da Silva": "FATS5213",
    "André Luiz Santos Santana": "REG161",
    "Andre Pires Araujo Kuhn": "MAN-40238",
    "Andressa Mirella Figueiras da Silva": "ALA0086",
    "Anésio Sousa Dos Santos Neto": "FATS4995",
    "Angel Cristian Barbosa Santos": "ALA0053",
    "Angelica da Silveira Lima": "SECBA0003",
    "Anna Carolina Araujo Romualdo": "ALA193",
    "Anna Paula Paz de Jesus": "ALA214",
    "Anselmo Luiz Lima Brito Junior": "FATS4796",
    "Antônia Raniele Costa Lima": "FATS4994",
    "Antonio Henrique Ramos Bismarck César": "ALA243",
    "Antonio Luis Gomes dos Santos": "FATS4334",
    "Antonio Marcos Pereira dos Santos": "SB0792",
    "Antonio Nery da Silva Filho": "FATS4119",
    "Antônio Pinto de Santana Neto": "FATS3506",
    "Ari Santos Gomes": "FATS1629",
    "Ariádene Gomes Pinheiro": "Alim00022",
    "Arícia Silva Gama Muniz": "FATS5141",
    "Arlete do Nascimento Rocha": "FATS5217",
    "Arthur Gomes Lima França": "AGLF857",
    "Audrei de Abreu Marques": "MOB 134",
    "Augusto Magno Ornelas Saraiva": "ALA286",
    "Áurea Pereira da Costa": "FATS5028",
    "Bárbara da Marilia Madureira Conceição": "FATS5099",
    "Bárbara Daiana da Anunciação Nascimento": "FATS5029",
    "BRUNO CHAVES SILVA": "ALA0074",
    "Bruno de Almeida Borges": "FATS4777",
    "Bruno de Menezes Moreira": "FATS5193",
    "Bruno dos Santos Pereira": "FATS5115",
    "Bruno dos Santos Pereira": "NORTE515",
    "Bruno Ferreira de Oliveira": "FATS5001",
    "Bruno Geovani Santos Silva": "ALA0119",
    "Bruno Oliveira da Silva": "FATS5825",
    "Bruno Paranhos Lima Bitencourt": "FATS3980",
    "Bruno Schramm Alves de Matos": "ALA282",
    "Caio Hamab Costa": "FATS4696",
    "Caio Rhuan Ribeiro Oliveira": "FATS5186",
    "Caique Barbosa Santos": "FATS5215",
    "Caleb Sena da Silva": "FATS4839",
    "Camila Martins Ghilardi": "FATS5200",
    "Camila Pereira da Silva": "FATS5065",
    "Carini dos Santos de Souza": "CAM 060",
    "Carla Evelin Xavier Freitas": "ALA247",
    "Carlos Alexandre Sant'ana Figueiredo": "ALA205",
    "Carlos André de Jesus Santos": "FATS4603",
    "Carlos Augusto da Cruz Santos de Jesus": "ALA245",
    "Carlos Augusto de Assis Alves Junior": "FATS5137",
    "Carlos Eduardo da Cruz Nascimento": "MOB 121",
    "Carlos Eduardo Ferreira Gomes": "FATS5083",
    "Carlos Robson Santos Cerqueira": "FATS4189",
    "Carmen Luft Bammesberger": "EAD388",
    "Carolina Gesteira Lopes Lima": "FATS3393",
    "Carolina Souto Ferreira": "FATS857",
    "Caroline Souza Cardoso da Silva Oliveira": "FATS5027",
    "Celia Nascimento Felix Filha": "SEG0035",
    "Celso de Oliveira": "FATS4739",
    "Chrislaynne Cardoso Cerqueira": "FATS4765",
    "Christiano Martinez Garcia": "FATS1060",
    "Cíntia Azevedo de Araújo": "FATS4170",
    "Cintia Gomes de Siqueira": "FATS5136",
    "CIRO TADEU DE MATOS BASTOS": "ALA0041",
    "Cislandia Maria dos Santos Oliveira": "FATS4648",
    "Clara Fernandes Bastos": "FATS5199",
    "Claryssa Palloma Rosa Barros de Oliveira": "FATS5204",
    "Claudemir Felix": "CALC 02",
    "Cláudia de Matos Santos": "FATS0005",
    "Claudia Mendes da Silva": "FATS4518",
    "Claudinei Aparecido Ferreira de Paula": "1940",
    "Claudiomiro José Henn": "CALC1103",
    "Cléa Mercedes Alves de Jesus Oliva": "FATS5110",
    "Cleomenes Nunes Torres": "FATS5092",
    "Clóvis Andrade Filho": "40704",
    "Crislane de Jesus Gomes": "ALA0132",
    "Crislayne Conceição da Silva de Oliveira": "FATS5103",
    "Cristiane de Souza Oliveira": "FATS5133",
    "Cristiane Pereira Santos de Souza": "FATS4658",
    "Cristiani de Moura": "ALA217",
    "Cristiano Vieira Santos Passos": "FATS5101",
    "Daiana de Oliveira Machado Bulos": "FATS5039",
    "Daiane dos Santos Carvalho": "FATS5093",
    "Daniel Austregesilo Xavier de Oliveira": "FATS4534",
    "Daniel da Silva Araújo": "FATS4079",
    "Daniel dos Santos Lima": "FATS5206",
    "Daniel Duarte de Souza da Silva": "FATS5149",
    "DANIEL FERNANDES LIMA BISPO": "FATS4496",
    "Daniel Rabelo do Vale": "GRAF814",
    "Daniela Borges Cerqueira Tavares": "FATS5155",
    "Daniela Silva Chagas": "FATS10000",
    "Danieli da Silva Machado Souza": "FATS5079",
    "Danilo Brandão Soares": "FATS5111",
    "Danilo Ferreira Barros": "FATS5127",
    "Danilo Souza de Oliveira": "FATS4682",
    "Dannywill Medeiros dos Santos": "ALA0129",
    "Dante Bitencourt Nascimento Filho": "ALA255",
    "Dante Nascimento Cunha": "CAM518",
    "Dara Lima Medeiros": "FATS3498",
    "Darlene Neves Ramos Liger": "FATS5061",
    "Davi dos Santos Haack": "FATS5032",
    "David Roberto Vasel": "EAD920",
    "Dayse Marana de Brito Araujo": "FATS3895",
    "Debora Maia Teixeira de Moura": "FATS4156",
    "Deivson Nonato Alves": "NGE6989",
    "Dejanira Silva Alves Pereira": "ALA0055",
    "Dejany dos Santos Silva": "CAM460",
    "Denilson Brito dos Santos": "MOB021",
    "Denivaldo de Queiroz Bispo": "FATS1687",
    "Dennis Jean Borges Rosado da Rocha": "065EAD",
    "Diana Pereira dos Santos": "FATS4966",
    "Diego de Oliveira Teixeira": "EAD052",
    "Diego Santos de Oliveira": "VEST120",
    "Dilma Ribeiro Lopes": "FATS4431",
    "Dilson Portela Santos": "MOB 017",
    "Dinis Caetano Pereira Nascimento": "FATS5162",
    "Divino Alves Vieira": "ALA252",
    "Docente Autoinstrucional": "AUTO",
    "Duilio Almeida Norberto Da Silva": "ALA257",
    "Dulcila Barreiros Torres": "REG241",
    "Ecatarine Ivi Guerrreiro de Freitas Figueiredo": "ALA207",
    "Eddie William Calazans Ventura": "EWCV030",
    "Edilma Mendes de Sousa": "FATS4585",
    "Edilza Santana Bomfim": "FATS5045",
    "Edimilson Chaves dos Reis": "FATS5002",
    "Edinaldo do Nascimento Pereira Gomes": "SLEM760",
    "Edmayre Coelho dos Santos": "FATS3186",
    "Edmilson da Silva Rocha": "FATS4472",
    "Edson dos Santos": "FATS4533",
    "Edson José Nunes": "FATS1596",
    "Edson Luiz Pinto Cruz Junior": "FATS4826",
    "Edvaldo Cerqueira Santos": "FATS5069",
    "Elaine Graziela Sampaio Passos": "FATS5195",
    "Elaine Santos Silva": "FATS5197",
    "Elder Nunes da Silva": "ALA200",
    "Eliana Pereira dos Santos": "MOU1971",
    "Eliandra dos Santos Mendes": "FATS4830",
    "Elias Dias Arruda de Paulo": "FATS183",
    "ELIAS WASHINGTON CAMPOS OLIVEIRA": "FATS5037",
    "Eliecy Guirra Reis": "SB0781",
    "Eliézer José da Silva": "FATS3277",
    "Eliseu Miranda Alves": "0FATS6814",
    "Ellen Midian Santana da Silva": "FATS4965",
    "Ellerry Lima Silva": "ALA0164",
    "Emanoel Ferreira Costa da Rocha": "FATS1690",
    "Emerson Salgado de Carvalho": "FATS5105",
    "Emilly Nathalia Sousa Almeida": "FATS4824",
    "Eneida Crisitina Cardoso das Neves": "FATS4538",
    "Enio Cezar Dias Junior": "ALA284",
    "Eric Cristiano Silva Soares": "ALA194",
    "Éric Nunes Gomes": "FATSI3204",
    "Érica Almeida Soares Araújo": "FATS5766",
    "Érica de Oliveira Silva": "FATS4821",
    "Érica Lavinia Borges Moraes de Oliveira": "FATS5019",
    "Erik do Carmo Marques": "FATS3304",
    "Erik do Carmo Marques": "FATS3438",
    "Erimonica Santos de Jesus Dantas": "FATS4054",
    "Euzebio Bastos da Silva": "FATS5077",
    "Evangildo Santana Santos": "ALA221",
    "Evans Andrade Costa": "CALC1236",
    "Evson Santos Silva": "ALA0014",
    "Fabiana Araujo Diniz": "EAD617",
    "Fábio da Silva Campos": "GES0112",
    "Fábio Luciano Carvalho dos Santos": "EMI00200",
    "Fabio Lúcio Almeida Lima": "CAM 004",
    "Fabrício da Silva do Espírito Santo": "FATS5166",
    "Fabrício Pacheco Borges": "SEG9136",
    "Fagna Gomes da Silva Santos": "FATS5050",
    "Felipe de Lima Oliveira": "FATS5112",
    "Fernanda de Matos Fialho Tojo": "Fats514",
    "Fernando Marafon Balem": "EAD06",
    "Fernando Vessosi Alberti": "EAD979",
    "Filipe Almeida da Conceição Inocencio": "FATS5120",
    "Filipe Santanna Freitas da Silva": "FATS4745",
    "Filipe Silva Santos": "ALA294",
    "Flávio Ferreira Barbosa": "FATS6870",
    "Francegleide Souza Oliveira": "ALA0145",
    "Francieli Pacassa": "EAD082",
    "Francielle Bitencourt de Oliveira": "FATS5004",
    "Francielli Pinto da Silva": "FATS4957",
    "Francisca Maria Mami Kaneoya": "FATS320",
    "Francisco Marcos Rosa de Sousa": "FATS4081",
    "Francisco Vieira Lima": "FATS5214",
    "Francklin Moura da Costa": "FATS5212",
    "Frederico Dominguez Fonseca": "FATS3114",
    "Frederico Iglezias Figueira": "FIF1300",
    "Gabriel Cabral Daltro": "FATS5074",
    "Gabriel Queiroz dos Santos": "FATS3597",
    "Gabriel Rocha Santos": "ALA264",
    "Gabriel Souza de Santana": "FATSC1559",
    "Gabriel Vitorio de Arcanjo": "FATS5114",
    "Gabriel Wendel Santos da Silva": "021EAD",
    "Gabrielle Albuquerque Maciel Brasileiro": "FATS5023",
    "Geandson Almeida de Sousa": "FATS4806",
    "Geisa Ferraz Lima Córdova": "FATS3452",
    "Genilson Santana Santos": "FATS5053",
    "Genival de Andrade Silva": "FATS031000",
    "Genivania Gomes Oliveira": "FATS4541",
    "George Anderson Soares e Sales": "NOAAUTO62",
    "George Bispo dos Santos": "ALA0070",
    "Gerusa Souza Pimentel": "FATS4736",
    "Giancarlo Alves Simões": "FATS999112",
    "Gilberto Lopes Nery": "FATS4988",
    "Gildean Santos Ribeiro": "GSR044",
    "Gilmar Menezes": "FATS4506",
    "Gilmar Pereira Mota": "FATS4972",
    "Gilmario dos Santos Machado": "FATS3992",
    "Gilsimar de Jesus Benicio": "FATS5082",
    "Gilson Marcelo da Silva Rios": "FATS5168",
    "Girlene Bispo de Oliveira": "FATS5012",
    "Gislana Santana Machado": "FATS5025",
    "Gizelle Karine Santos Alcantara": "ALA231",
    "Gleice da Silva Diogo": "FATS4463",
    "Gleison Fernandes da Silva": "FATS5106",
    "Guilherme Canarin Marcellino": "EAD050",
    "Hanna Mayara Miranda Araujo": "FATS5126",
    "Hebert Santos Peneluc": "ALAA007",
    "Henderson Cari Nascimento": "EAD070",
    "Henderson Souza Chalegre": "FATS5051",
    "Henrique Silveira Alves Marques": "SNSUD240",
    "HERBERT CÂNDIDO DOS SANTOS": "ALA0167",
    "Heron Borges Machado": "FATS4793",
    "Hiago Santos Silva": "ALA250",
    "Hikaro dos Santos Carvalho": "FATS4599",
    "Hilton Brandão": "FATSI1797",
    "Hipólito Matos Carneiro": "FATS5205",
    "Hudson de Carvalho Lima": "FATS4413",
    "Iago de Cerqueira Azevedo": "FATS5006",
    "Ian Hudson Martins de Oliveira": "FATS4816",
    "Ian Pedro Martinez Silva": "FATS4735",
    "Iara de Andrade Oliveira": "FATS4998",
    "Ícaro Vasconcelos Alvim": "FATS4803",
    "Igor Ernandez Almeida Santana": "CAM 213",
    "Igor Silva Marques": "FATS5009",
    "Igor Souza de Almeida": "ALA263",
    "Iguaraci de Souza Tavares": "ALA249",
    "ILKA MARA ALVES DA SILVA": "FATS5000",
    "Ingrid Barreto de Almeida Passos": "FATS4576",
    "Ingrid Rocha Teixeira": "ALA259",
    "Iraneide dos Anjos dos Santos": "FATS5094",
    "Iranilton Pereira Santos": "ALA269",
    "Iris Araújo Silva": "FATS5143",
    "Irlan Silva de Almeida": "FATS5154",
    "Iromar de Freitas Nascimento Filho": "FATS5078",
    "Isaac Porto Assunção": "FATS4082",
    "Islane Ferreira de Andrade": "FATS5090",
    "Ismael de Andrade Gonçalves": "FATS4855",
    "Ivan Gomes Soares": "ALA230",
    "Ivanildo Gomes da Silva": "FATS4960",
    "Ivo Ribeiro Almeida": "FATS5054",
    "Jaciane Saba Bispo": "FATS5172",
    "Jaciara Teodora dos Reis Malta": "ALA0151",
    "Jadiane de Almeida Ribeiro de Santana": "NOAVIRT027",
    "Jadieli Sansão Elias Lima": "ALA0061",
    "Jadilma Rodrigues da Silva Dias": "FATS3874",
    "Jailson dos Santos Júnior": "ALA0152",
    "Jair Santos de Almeida": "FATS3319",
    "Jairo Alves da Silva": "PLAN2011",
    "Jamile Batista dos Santos": "ALA0017",
    "Janaína Gonçalves Bastos": "FATS3368",
    "Janielson Barbosa de Oliveira": "FATS5150",
    "Jaqueline de Souza Pereira": "ALA0149",
    "Jaqueline Santos da Silva": "FATS5063",
    "Jean dos Santos Carvalho Goes": "FATS4969",
    "Jean Moreira Lins": "MAN-40233",
    "Jeane Cerqueira Ferreira": "FATS4794",
    "Jeane Lima dos Santos": "FATS5216",
    "Jeanildo de Aragão Alves": "FATS5026",
    "Jeferson Navarro": "FATS5046",
    "Jefferson Leite de Jesus": "FATS4955",
    "Jefté Goes Salvador Silva": "FATS4838",
    "Jeilson Soares Cerqueira": "SLEM0049",
    "Jeovan Moreira dos Reis": "FATS4234",
    "Jessica Alves Dutra": "FATS5222",
    "Jéssica Franco Freitas Macena": "FATS5219",
    "Jéssica Queli Santos Santana Nunes": "FATS5015",
    "Jessiele Caroline Santos Santana Nunes": "FATS4996",
    "Jhonatan Filippe Alves Macedo": "FATS5140",
    "Jhonne Elson Queiroz Moreira": "FATS4644",
    "Joab Lima Alves": "FATS4723",
    "Joacy Marley Queiroz Mota": "FATS4844",
    "Joane de Jesus Araújo": "FATS5057",
    "João Batista Moura Santos": "FATS3163",
    "João Fernando Souza Flores Filho": "ALA271",
    "João Gabriel Ferreira Vitório": "FATS4672",
    "João Gabriel Santos de Souza": "ALA209",
    "João Garcia da Mota": "QTEC10001",
    "João Guilherme Lisboa Moreira": "FATS4991",
    "João Marcos Araujo Pereira": "FATS4028",
    "João Marcos Xavier Matos": "ALA0177",
    "João Paulo Dias da Silva Munck": "EAD118",
    "João Valter Batista Santos Filho": "FATS4727",
    "João Vitor Ferreira Matos": "FATS4981",
    "João Vitor Merlo": "096EAD",
    "João Vitor Santos Silva": "ALA228",
    "Joce Macedo Ramos": "FATS3281",
    "Jociel Alves de Jesus": "FATS4831",
    "Joeli Rodrigues da Hora": "254218",
    "Joéliton Santos Neri": "FATS8640",
    "Joice Oliveira de Jesus Bastos": "ALA0114",
    "Joilson Garcia da Mota": "FATS4606",
    "Jonatah Nery de Carvalho": "432158",
    "Jonatas Mendes dos Santos": "FATS5089",
    "Jones Emanuel dos Santos Junior": "EMI318",
    "Jorgeana Shirley dos Santos": "FATS5067",
    "Jorgevany Almeida Santos": "REG145",
    "José Ademar da Silva de Souza Junior": "FATS5038",
    "Jose Antonio de Oliveira Fonseca": "FATS4713",
    "José Batista de Macedo Júnior": "FATS4798",
    "José Benedito de Lima": "FATS3033",
    "José da Costa Lima Neto": "FATS3598",
    "JOSE DOMINGOS NUNES DOS SANTOS": "FATS5040",
    "José Eliseu Araújo Damião": "FATS5097",
    "José Fabricio Oliveira de Santana": "FATS5073",
    "José Luis da Silva Rocha": "REG213",
    "José Marciel Reis Mascarenhas": "VEST187",
    "Jose Mario de Jesus Pinheiro": "FATS5163",
    "José Milton Vitorino dos Reis": "FATS4482",
    "José Vagner de Souza Batista": "FATS4814",
    "José Vital de Souza Filho": "CAM 075",
    "Josefa Fagner dos Santos": "FATS5033",
    "Joselia Lima de Sena Alves": "FATS5052",
    "Josenildo Macêdo Oliveira": "FATS5170",
    "Josete Oliveira Carvalho": "FATS5042",
    "Josi dos Anjos Silva": "FATS4520",
    "Josilene da Silva de Jesus": "FATS5044",
    "Josimary Kelly Amado Santos": "ALA270",
    "Josue dos Santos Souza": "ALA224",
    "Josué Leite Conceição": "FATS3309",
    "Josué Oliveira de Araujo": "FATS4804",
    "Jozan dos Santos Barbosa": "SOLD043",
    "Juciara Pedreira de Jesus Freitas": "FATS4586",
    "Jucinaldo Cardoso dos Reis": "FATS4382",
    "Julia dos Anjos Costa": "FATS4086",
    "Júlia Oliveira Cordeiro": "FATS4477",
    "Juliana Santos da Silva": "FATS5148",
    "Juliana Silva Bastos": "FATS5041",
    "Juliana Vieira Santos Pereira": "SECBA0012",
    "Juracy Oliveira Cardoso": "FATS5008",
    "Justino Neves de Jesus Neto": "FATS4542",
    "Karina Casola Fernandes": "EAD023",
    "Karine das Neves Paixão Silva": "FATS3863",
    "Karoline Conceicao da Fonseca Santos": "SLEM718",
    "Karolyne Mota Gomes": "FATS4770",
    "Kelly Dourado Rodrigues": "FATS72479",
    "Kleber Bomfim de Oliveira": "FATS4761",
    "Laecio dos Santos Teixeira": "FATS4989",
    "Laís Leão Sampaio Leite": "FATS5165",
    "Lais Lorena Ribeiro": "ALA210",
    "Layla de Oliveira Pires Aquino": "CAM469",
    "Leandro dos Santos Viana": "FATS5218",
    "Leandro Neves Alves": "LNA0324",
    "Leandro Silva Costa": "FATS5064",
    "Leda dos Santos Souza": "FATS1575",
    "Leilane Ferreira Santos": "FATS5207",
    "Leiliane Vieira Souza": "FATS5182",
    "Leniel Oliveira dos Santos": "ALA223",
    "Leonard Fernandes e Silva": "ALA183",
    "Leonardo Andrade Souza": "FATS5096",
    "Leonardo Argolo dos Santos": "FATS5036",
    "Leonardo da Costa Lins": "ALA125",
    "Leonardo Silva Pinto": "FATS4718",
    "Leonice Nascimento Santiago": "FATS4961",
    "Leticia Rodrigues Pereira de Santana": "FATS4962",
    "Létícia Rosa de Jesus": "FATS4982",
    "LÍBIA XIMENES CABRAL MARTINS": "ALA0023",
    "Lidiane de Jesus Freitas": "FATS4250",
    "Liliane Ribeiro dos Santos": "FATS99963",
    "Liliane Ribeiro dos Santos Fernandes": "ALA253",
    "Lindinéia Gomes Bastos": "CALC1235",
    "Lindomar Carlos Sodré da Silva": "FATS3667",
    "Lindsei Oliveira Machado": "FATS5018",
    "Lívia Graziele Gomes Ramos da Silva": "MAN-40087",
    "Livia Suely Silva Souza": "FATS4152",
    "Liziane da Silva Carneiro": "FATS5070",
    "Luan Guimarães da Silva": "FATS4810",
    "Luana Moura Silva": "FATS5123",
    "Luana Silva dos Santos": "FATS5024",
    "Lucas Cauã de Souza Mota": "FATS4829",
    "Lucas da Glória Oliva Costa": "FATS5138",
    "Lucas Moreira Reis": "FATS4976",
    "Lucas Porto Assunção": "FATS3968",
    "Lucas Santos Brandão": "FATS5107",
    "Lucas Silva Sampaio": "ALA237",
    "Lucas Soares Santos": "FATS566",
    "Luciana Cassia Goes Pereira": "ALA285",
    "Luciana dos Santos Silva Marques": "FATS4843",
    "Luciana Maria Limeira dos Santos": "CALC1233",
    "Luciana Mendes Brito Vidal": "SECBA101",
    "Luciana Santos Nobre": "FATS4158",
    "Luciano Santos Ribeiro": "AUTOMO24",
    "Luciélia dos Santos Novaes": "CALC1243",
    "Lucineide Miranda Silva Araújo": "FATS4537",
    "Lucio Roberto Severo Rosas": "ALA0020",
    "Lucivânia Silva Carneiro de Cintra": "FATS4274",
    "Luidivan Rodrigues Alves": "FATS3230",
    "Luis Fabio Santos da Silva": "ALA238",
    "Luis Tertuliano Silva de Souza": "CAM 347",
    "Luiz Carlos Campos Torres": "EAD922",
    "Luiz Eduardo Araujo Machado": "FATS4827",
    "Luiz Eduardo Batista Barreto Junior": "FATS4020",
    "Luize Muricy dos Santos Vieira": "FATS4851",
    "Lumma da Silva Borges": "FATS4578",
    "Luziete Moreira Santos": "FATS5072",
    "Luzimary Carneiro de Lima": "FATS5132",
    "Magna Maria Lima": "FATS5091",
    "Magno Santana Morais": "FATS999143",
    "Maiara Argolo Negromonte": "FATS4367",
    "Maiara de Jesus Araújo": "FATS5031",
    "Maicon Luiz Muniz da Silva": "FATS5013",
    "Maida Santos Alcântara": "FATS5174",
    "MANOEL DAMASIO ALVES": "FATS5034",
    "Manoel Gustavo Souza de Almeida Pina": "MGSAP068",
    "Manoel Hito Sampaio Mascarenhas": "CALC1272",
    "Manoel Serafim da Silva Neto": "FATS7854",
    "Manoela Trabuco de Queiroz": "FATS5151",
    "Marcello Oliveira Coelho Silva": "FATS5066",
    "Marcelo de Vasconcelos Pereira": "FATS4741",
    "Marcelo dos Santos Santana": "FATSI96180",
    "Marcelo Luis Moreira Sousa": "FATS987563",
    "Marcelo Márcio de Oliveira Ferreira": "11208401",
    "Marcelo Santana Lacerda": "SNSUD343",
    "Marcilio Aquino Marques": "FATS5201",
    "Márcio Lima Carneiro de Oliveira": "FATS4813",
    "Marco Antonio Maia Santos": "FATS4992",
    "Marcos Antônio Vieira Costa": "FATS5128",
    "Marcos Augusto de Jesus Souza": "FATS4392",
    "Marcos Cesar Nunes Laranjeiras Filho": "MCNLF-038",
    "Marcos Davi Barbosa de Oliveira": "FATS3198",
    "Marcos de Souza Simões": "FATS4671",
    "Marcos Paulo Araujo Santiago": "FATS2801",
    "Marcos Teixeira Quadro": "FATS4050",
    "Marcos Vinicius Cerqueira Santos": "ALA240",
    "Marcos Vinicius de Oliveira Santos": "FATS4272",
    "Marcos Vinicius Petri": "EAD691",
    "Maria das Graças Oliveira Lira": "FATS4325",
    "Maria Do Carmo Souza Santos": "ALA190",
    "Maria Fernanda Menezes de Oliveira de Souza": "CAM470",
    "Maria Gilcilene Maciel Rocha": "FATS5055",
    "Maria Izabel Cruz Alves Simões": "FATS5113",
    "Maria Janaina Daltro Alves": "FATS3901",
    "Maria Mariluce Vitalino Santos": "ALA203",
    "Mariana do Rosário Liger": "ALA235",
    "Mariana Moura Pinheiro": "FATS4975",
    "Mariana Torres Uchôa": "EAD03",
    "Marileia Araujo da Silva": "FATS3072",
    "Marilene Santos de Jesus Lins": "FATS4512",
    "Marilia Neri Porto": "FATS4834",
    "Marina Ane Gomes Cordeiro": "FATS5220",
    "Marina Brayner dos Santos": "ALA248",
    "Mario Andre Correia Ribeiro": "FATS5121",
    "Marisete Kniess Adriano": "FATS045",
    "Mariza de Oliveira Conceição Bela": "FATS4964",
    "Marlangela Santos Cunha": "FATS5005",
    "Marlon Nunes Couto": "FATS5210",
    "Marta Farias Almeida da Silva": "FATS5007",
    "Mateus de Santana Souza": "FATS4150",
    "Matheus Araujo de Assis": "FATS3332",
    "Matheus Barreto Ribas": "12275752",
    "Matheus da Silva Teixeira": "FATS4263",
    "Matheus de Oliveira": "EAD091",
    "Matheus Nunes Menezes": "ALA216",
    "Mathias de Oliveira Carneiro": "FATS5192",
    "Mauricio de Almeida Silva": "FATS4568",
    "Maurino Candido de Medeiros": "FATS3287",
    "Maxuel Carlos de Melo": "FATS3359",
    "Mayk Fernandes Lima da Silva": "FATS5003",
    "Meirise Araújo dos Santos Silva": "FATS4997",
    "Mennandro Menezes de Oliveira": "FATS1703",
    "Merilin Gomes de Oliveira Moreira": "FATS4726",
    "Michelle Sousa de Freitas": "FATS5117",
    "MIGUEL DA SILVA BASTOS": "FATS5043",
    "MILENA CORDEIRO DA SILVA": "ALA0039",
    "Milena Fonsêca Rios Araújo": "FATS5179",
    "Milena Ribeiro dos Santos": "NGE99",
    "Milenna Santos Silva": "FATS3966",
    "Millena Pereira Brito": "FATS4974",
    "Mirela Macedo Sandes": "FATS4730",
    "Mirian Maria Araújo": "FATS5144",
    "Moisés Lima Santos": "80993",
    "Murilo Gomes Santana": "FATS5211",
    "Nadja Rita Santos Cezar": "FATS5152",
    "Naila Naja Silva Soares": "FATS5116",
    "Natália Campbell Correa": "58086",
    "Natalia Cristina Amorim Nascimento": "FATS3128",
    "Natalicio Diego da Silva": "FATS5118",
    "Natanael do Nascimento Pereira Neto": "ALA234",
    "Nathanael Pereira de Oliveira": "FATS5095",
    "Nayara Oliveira de Lima": "ALA297",
    "Nayara Santos Queiroz": "ADM01",
    "Neidson Santana de Souza": "FATS3967",
    "Nilo Dantas da Silva": "FATS5021",
    "Norman Bitencourt da Silva Montenegro": "ALA296",
    "Nubia Oliveira da Silva": "FATS4024",
    "Nubia Viana Cardoso Leal": "FATS5130",
    "Olandiara de Aragão dos Santos": "GES0751",
    "Osny Dantas de Oliveira Silva": "EAD007",
    "Osvaldo da Silva Neto": "009EAD",
    "Otávio Teixeira Pinto": "FATS016",
    "Ozair Santos Lima": "FATS4608",
    "Pablo Cruz de Santana": "ALA0155",
    "Pâmela Villare Fernandes Fonseca": "FATS4258",
    "Patricia Claudia da Silva": "FATS5119",
    "Patrícia Cristiane Alcarria Martins": "FATS1927",
    "Patricia dos Santos": "NOAVIRT050",
    "PATRICIA REIS CALASANS": "PRC0309",
    "Patrícia Silva das Merces": "FATS5129",
    "Paulo Ferreira da Costa Neto": "ALA258",
    "Paulo Sergio da Silva Oliveira Junior": "FATS5142",
    "Paulo Victor Aragão dos Santos": "FATS5135",
    "Pedro Geraldo Correia da Silva": "3",
    "Pedro Henrique Almeida dos Santos Alves": "NOAVIRT033",
    "Pedro Ivo Santos Furtado": "MAN40106",
    "Pedro Kleber Matos de Araujo": "FATS4064",
    "Pedro Lopes Batista Neto": "ALA283",
    "Pedro Raimundo Soares da Conceição": "FATS1634",
    "Phillipe Ramos Brandão": "FATS4262",
    "Poliana Silva Araújo": "MAT2304",
    "Priscila Mikulski Guedes": "PMG0194",
    "Priscila Natividade de Jesus": "FATS5017",
    "Priscila Saturnino dos Santos Brandão": "FATS5022",
    "Priscila Souza Azevedo": "FATS5098",
    "Priscilla Araujo Vieira": "FATS4849",
    "Quécia Ferreira de Oliveira": "FATS4799",
    "Quelen Priscila Santana da Silva Santos": "FATS4967",
    "Quelme de Jesus Silva Brito": "FATS5016",
    "Rachell Adrielle Bomfim Reis Santos": "ALA272",
    "Rafael Brito Teixeira": "SNSUD387",
    "Rafael Nascimento Caldeira": "ALA287",
    "Rafael Parenti": "EAD085",
    "Rafaella Braga Santos": "FATS4999",
    "Rafaella Cerqueira Oliveira Souza": "FATS5075",
    "Raphaela Santana Melo Araujo": "FATS5131",
    "Raul Dauram de Vasconcelos": "NORTE349",
    "Rayanna Rodrigues Evangelho": "FATS5056",
    "Regis Marsico Cayret": "FATS4342",
    "Regivaldo Francisco da Silva Junior": "FATS5159",
    "Reinalda dos Santos Ramos": "FATS4983",
    "Reinaldo Silva de Sena": "FATS4970",
    "Renaldo dos Santos Ramos": "ALA229",
    "Renan do Carmo Araujo": "ALA275",
    "Renata da Purificação Pinto": "FATS3363",
    "Renato Buranelli": "ALA0147",
    "Renildo da Silva Santos": "FATS5160",
    "Rescima Fernanda Novais dos Santos": "FATS4993",
    "Rhavi Gonçalves de Borda": "FATS071",
    "Rita Urânia Silva Santos": "FATS5109",
    "Roberta Silva Pereira": "FATS4292",
    "Roberto Carrion Eça da Silva": "PRON8579",
    "Robson Carvalho Freitas": "FATS4802",
    "Rodrigo Roberto Dias": "EAD024",
    "Rogério Cerqueira Lima": "FATS1667",
    "Rogerio da Silva Fiscina": "SNSUD216",
    "Romário Andrade Rodrigues": "FATS3278",
    "Romulo Carvalho de Souza Vieira": "ALA277",
    "Romulo Lopes Souza": "FATS1708",
    "Ronaldo Soares Monteiro": "FATS5169",
    "Ronei Vagner Alves": "EAD038",
    "Roquelane Ramos da Conceição": "FATS5030",
    "Rosenilson Lima Macêdo": "FATS1709",
    "Rosilene da Silva Dias": "FATS4179",
    "Rosimeire de Vasconcelos": "ALA0113",
    "RUBENS OLIVEIRA LIMA JUNIOR": "FATS5035",
    "Rudney Oliveira de Freitas": "NORTE 527",
    "Sabrina Bet": "EAD0055",
    "Samer Magaldi Almerindo": "EAD054",
    "Samuel da Silva Cunha": "FATS5161",
    "Saolo Santos Souza": "ALA246",
    "Sergio Henrique Ferreira Martins": "FATS3912",
    "Shirlei Lima dos Anjos": "ALA197",
    "Sidnei dos Santos Sacramento": "ALA0076",
    "Sidney Conceição Andrade": "CALC1246",
    "Sidney da Silva Jesus": "ALA208",
    "Silas Pereira Santos": "ALA128",
    "Silas Santos Carvalho": "FATS4340",
    "Sillas Leal Castro Silva": "FATS3399",
    "Silmara Simas dos Santos": "FATS5202",
    "Silvano Pinto Dias": "FATS3256",
    "Silvoney Santos Couto": "CALC1252",
    "Simone dos Santos do Amaral": "FATS4971",
    "Sirlex de Almeida Figueredo": "FATS4776",
    "Sócrates Sousa Queiroz": "FATS3042",
    "Solismar De Souza Aroeira": "FATS5134",
    "Stefanie Daysy Sipert Miranda": "NOAVIRT03",
    "Sterfany da Silva Almeida": "FATS5059",
    "Sueli Oliveira Costa": "FATS4956",
    "Sueli Vieira Leão": "SVL8192",
    "SUNANDA MARIA RODRIGUES BATISTA": "ALA0063",
    "Suran Oliveira Messias": "FATS4600",
    "Suzanna Raquel Ramos Lima": "ALA256",
    "Tainá Melo de Oliveira": "FATS4797",
    "Talita Emanuele Abreu da Silva": "FATS5104",
    "Tamara Eloy Caldas": "FATS4400",
    "Tânia Maria Cardoso Cerqueira": "TMCC466",
    "Tania Renilda Santos Torres": "TRST009",
    "Tarcisio Marques Santos de Souza": "FATS3909",
    "Tassio de Freitas Ferreira": "FATS3335",
    "Tayane de Jesus Nunes": "TJN026",
    "Tércio Borges Ribeiro": "EAD094",
    "Thaiany Santana da Cruz Nunes": "FATS4963",
    "Thais Santana Barreto": "NOAVIRT035",
    "Thiago Alves Carneiro": "FATS4800",
    "Thiago Jesus de Oliveira Trindade": "ALA0179",
    "Thiago Mendes Paixão Melo": "FATS4688",
    "Thiago Vinicius Barbosa Menezes Sales": "ALA0012",
    "Thomas Santos da Silva": "FATS4615",
    "Tiago Araujo Freaza dos Santos": "FATS5058",
    "Tiago Araujo Matos": "FATS5196",
    "Tiago da Silva Oliveira": "FATS4661",
    "Tiago Luis Santos Silva": "ALA213",
    "Tiago Martins dos Santos de Jesus": "ALA233",
    "TIAGO MEDRADO COSTA": "FATSI9613",
    "Tony Clériston Oliveira dos Santos": "FATS4575",
    "Topson Andrade dos Santos": "SECBA0060",
    "Ualison Pereira Roque Freitas": "FATS5100",
    "Uallas Henrique de Oliveira de Brito": "030EAD",
    "Uerles Bastos de Menezes": "FATS4978",
    "Uilberton de Oliveira Soares": "UOS0253",
    "Vando Silva Bizerra": "FATS3378",
    "Vanessa de Oliveira Debiasi": "FATS072",
    "Vanessa Silva Lima": "FATS4817",
    "Vanessa Vilanova Fraga Vieira": "CAM 267",
    "Vânia Lago Guimarães Correia": "FATS3925",
    "Velluma Cerqueira Invenção de Oliveira": "FATS5167",
    "Victor da Silva Pimenta": "FATS4973",
    "Victor Lima Cardoso": "ALA0058",
    "Victor Moak da Silva Souza": "FATS4854",
    "Victor Montes Fernandes Pereira": "ALA242",
    "Victor Oliveira Mascarenhas": "FATS4636",
    "Vinicius Camelo Molinari": "slem222",
    "Vinicius Lima Cardoso": "NGE70110",
    "Vinícius Ornellas de Araújo": "ALA239",
    "Viviane Rafael Ferreira": "FATS5102",
    "Wagner José Mezoni": "004EAD",
    "Waldemir Pereira Santiago": "FATS5145",
    "Wanna Nascimento Macedo": "FATS5011",
    "Weiller Queiroz Silva": "FATS5068",
    "Welber Lima de Brito Guimarães": "NORTE277",
    "Welder Nascimento dos Santos": "FATS5048",
    "Welder Nascimento dos Santos": "FATS5081",
    "Welington Salomão Pereira": "FATS4832",
    "Wesley Moura da Silva Pereira": "FATS4536",
    "Wguaracy Araujo Santana": "FATS4300",
    "William Martins Lopes Ribeiro": "FATS4647",
    "Williane Santana Marques": "FATS5076",
    "Wilton Silva Souza": "ALA198",
    "Yanes Costa Nascimento": "FATS4968",
    "Yanna Carvalho de Assis": "FATS3634",
    "Zilmaura Santos Daltro": "FATS4775"
};

// Salva os dados no localStorage
localStorage.setItem("docentesCodprof", JSON.stringify(docentesCodprof));

// Função para adicionar novo professor ao mapeamento docentesCodprof
function addProfessorToMapping(professorName, fast) {
    if (!professorName || !fast) {
        console.warn('Nome do professor e FAST são obrigatórios para adicionar ao mapeamento');
        return false;
    }
    
    // Normaliza o FAST para maiúsculas
    const normalizedFast = fast.toString().trim().toUpperCase();
    const normalizedName = professorName.trim();
    
    // Verifica se o professor já existe
    if (docentesCodprof[normalizedName]) {
        console.warn(`Professor ${normalizedName} já existe no mapeamento com FAST: ${docentesCodprof[normalizedName]}`);
        return false;
    }
    
    // Verifica se o FAST já está sendo usado por outro professor
    for (const [existingName, existingFast] of Object.entries(docentesCodprof)) {
        if (existingFast === normalizedFast) {
            console.warn(`FAST ${normalizedFast} já está sendo usado pelo professor: ${existingName}`);
            return false;
        }
    }
    
    // Adiciona o professor ao mapeamento
    docentesCodprof[normalizedName] = normalizedFast;
    
    // Salva no localStorage para persistência
    saveDocentesCodprofToStorage();
    
    console.log(`✅ Professor ${normalizedName} adicionado ao mapeamento com FAST: ${normalizedFast}`);
    return true;
}

// Função para salvar o mapeamento docentesCodprof no localStorage
function saveDocentesCodprofToStorage() {
    try {
        localStorage.setItem('docentesCodprof', JSON.stringify(docentesCodprof));
        console.log('📁 Mapeamento docentesCodprof salvo no localStorage');
    } catch (error) {
        console.error('❌ Erro ao salvar mapeamento no localStorage:', error);
    }
}

// Função para carregar o mapeamento docentesCodprof do localStorage
function loadDocentesCodprofFromStorage() {
    try {
        const saved = localStorage.getItem('docentesCodprof');
        if (saved) {
            const savedMapping = JSON.parse(saved);
            // Merge com o mapeamento existente (localStorage tem prioridade)
            Object.assign(docentesCodprof, savedMapping);
            console.log('📁 Mapeamento docentesCodprof carregado do localStorage');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar mapeamento do localStorage:', error);
    }
}

// Função global para ser chamada de outras páginas
window.addNewProfessorToTeacherPanel = function(professorName, fast) {
    return addProfessorToMapping(professorName, fast);
};

// Função para visualizar todos os professores cadastrados (útil para debug)
window.viewAllProfessors = function() {
    console.log('👥 Professores cadastrados no mapeamento:');
    console.table(docentesCodprof);
    const total = Object.keys(docentesCodprof).length;
    console.log(`📊 Total de professores cadastrados: ${total}`);
    return docentesCodprof;
};

// Função para contar professores cadastrados
window.countProfessors = function() {
    const total = Object.keys(docentesCodprof).length;
    console.log(`📊 Total de professores cadastrados: ${total}`);
    return total;
};

// Função para buscar professor por FAST
window.findProfessorByFast = function(fast) {
    for (const [name, professorFast] of Object.entries(docentesCodprof)) {
        if (professorFast === fast) {
            return name;
        }
    }
    return null;
};

// Função para exportar o mapeamento atualizado como código JavaScript
window.exportDocentesCodprof = function() {
    const mappingEntries = Object.entries(docentesCodprof)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, fast]) => `    "${name}": "${fast}"`)
        .join(',\n');
    
    const exportCode = `const docentesCodprof = {\n${mappingEntries}\n};`;
    
    console.log('📋 Código do mapeamento atualizado:');
    console.log(exportCode);
    
    // Copiar para clipboard se disponível
    if (navigator.clipboard) {
        navigator.clipboard.writeText(exportCode).then(() => {
            console.log('✅ Código copiado para a área de transferência!');
        }).catch(err => {
            console.error('❌ Erro ao copiar para área de transferência:', err);
        });
    }
    
    return exportCode;
};

// Evento para escutar mudanças no localStorage de outras páginas
window.addEventListener('storage', function(e) {
    console.log('📱 Evento storage recebido:', {
        key: e.key,
        oldValue: e.oldValue ? 'presente' : 'null',
        newValue: e.newValue ? 'presente' : 'null'
    });
    
    if (e.key === 'docentesCodprof') {
        console.log('🔄 Detectada atualização no mapeamento docentesCodprof de outra página');
        loadDocentesCodprofFromStorage();
    }
    
    if (e.key === 'allDateShiftData') {
        console.log('🔄 Detectada atualização nos dados de turnos de outra página');
        loadSharedData();
    }
    
    if (e.key === 'allShiftData') {
        console.log('🔄 Detectada atualização no allShiftData de outra página');
        loadSharedData();
    }
});

// Evento para escutar mudanças específicas de registros do painel administrativo
window.addEventListener('dataUpdated', function(e) {
    console.log('📢 Evento dataUpdated recebido:', e.detail);
    
    if (e.detail && e.detail.type === 'recordUpdated') {
        console.log('🔄 Detectada atualização de registro específico:', e.detail);
        
        // Recarregar dados e atualizar a tabela
        loadSharedData().then(() => {
            console.log('✅ Dados atualizados no painel do professor');
            
            // Mostrar notificação visual da atualização
            showUpdateNotification(e.detail);
        });
    }
});

// Função para mostrar notificação de atualização
function showUpdateNotification(updateDetail) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    notification.innerHTML = `
        <i class="bi bi-info-circle me-2"></i>
        <strong>Dados Atualizados!</strong><br>
        <small>Registro atualizado pelo administrador</small>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Retorna o FAST correspondente ao nome do professor informado
function getFastForProfessor(professorName) {
    if(!professorName || typeof professorName !== 'string') return '';
    
    if(docentesCodprof[professorName]) return String(docentesCodprof[professorName]).trim();
    
    const target = professorName.trim().toLocaleLowerCase('pt-BR');

    for(const name of Object.keys(docentesCodprof)) {
        if(name.trim().toLocaleLowerCase('pt-BR') === target) {
            return String(docentesCodprof[name]).trim();
        }
    }

    return '';
}

// Função para obter ou criar estrutura de dados para uma data
function getDataForDate(date) {
    console.log(`[PROFESSOR] ==> getDataForDate chamada para: ${date}`);
    console.log(`[PROFESSOR] ==> dataByDateAndShift[${date}] existe?`, !!dataByDateAndShift[date]);
    
    if (!dataByDateAndShift[date]) {
        console.log(`[PROFESSOR] ==> Criando estrutura vazia para data ${date}`);
        dataByDateAndShift[date] = {
            'manhã': [],
            'tarde': [],
            'noite': []
        };
    }
    
    console.log(`[PROFESSOR] ==> Retornando dados para ${date}:`, dataByDateAndShift[date]);
    return dataByDateAndShift[date];
}

// Função para converter dados do formato admin para professor
function convertAdminDataToTeacherFormat(data) {
    const convertedData = {};
    
    for (let date in data) {
        convertedData[date] = {};
        for (let turno in data[date]) {
            if (Array.isArray(data[date][turno])) {
                convertedData[date][turno] = data[date][turno].map(item => {
                    // Se está no formato do painel administrativo, converter
                    if (item.room && item.professorName) {
                        return {
                            sala: item.room || 'Sala não especificada',
                            professor: item.professorName || 'Professor não especificado',
                            disciplina: item.subject || '-',
                            curso: item.course || '-',
                            turma: item.turmaNumber || '-',
                            horaRetirada: item.withdrawalTime || null,
                            horaDevolucao: item.returnTime || null,
                            // Manter campos originais para compatibilidade
                            room: item.room,
                            professorName: item.professorName,
                            subject: item.subject,
                            course: item.course,
                            turmaNumber: item.turmaNumber,
                            withdrawalTime: item.withdrawalTime,
                            returnTime: item.returnTime,
                            status: item.status || 'disponivel',
                            id: item.id || ''
                        };
                    }
                    // Se já está no formato do professor, manter
                    else if (item.sala && item.professor) {
                        return {
                            ...item,
                            // Adicionar campos do formato admin para compatibilidade
                            room: item.sala,
                            professorName: item.professor,
                            subject: item.disciplina,
                            course: item.curso,
                            turmaNumber: item.turma,
                            withdrawalTime: item.horaRetirada,
                            returnTime: item.horaDevolucao,
                            status: item.horaRetirada && !item.horaDevolucao ? 'em_uso' : 
                                   item.horaRetirada && item.horaDevolucao ? 'devolvida' : 'disponivel',
                            id: item.id || item.sala
                        };
                    }
                    // Fallback para dados mal formatados
                    else {
                        return {
                            sala: item.sala || item.room || 'Sala não especificada',
                            professor: item.professor || item.professorName || 'Professor não especificado',
                            disciplina: item.disciplina || item.subject || '-',
                            curso: item.curso || item.course || '-',
                            turma: item.turma || item.turmaNumber || '-',
                            horaRetirada: item.horaRetirada || item.withdrawalTime || null,
                            horaDevolucao: item.horaDevolucao || item.returnTime || null,
                            // Campos de compatibilidade
                            room: item.sala || item.room,
                            professorName: item.professor || item.professorName,
                            subject: item.disciplina || item.subject,
                            course: item.curso || item.course,
                            turmaNumber: item.turma || item.turmaNumber,
                            withdrawalTime: item.horaRetirada || item.withdrawalTime,
                            returnTime: item.horaDevolucao || item.returnTime,
                            status: (item.horaRetirada || item.withdrawalTime) && !(item.horaDevolucao || item.returnTime) ? 'em_uso' : 
                                    (item.horaRetirada || item.withdrawalTime) && (item.horaDevolucao || item.returnTime) ? 'devolvida' : 'disponivel',
                            id: item.id || item.sala || item.room
                        };
                    }
                });
            } else {
                convertedData[date][turno] = data[date][turno] || [];
            }
        }
    }
    
    return convertedData;
}

// Função para obter dados do turno atual na data selecionada
function getCurrentShiftData() {
    console.log(`[PROFESSOR] ==> getCurrentShiftData chamada para data: ${selectedDate}, turno: ${activeShift}`);
    console.log(`[PROFESSOR] ==> dataByDateAndShift completo:`, dataByDateAndShift);
    
    // Validar se selectedDate e activeShift estão definidos
    if (!selectedDate || !activeShift) {
        console.error(`[PROFESSOR] ==> ERRO: selectedDate (${selectedDate}) ou activeShift (${activeShift}) não definidos`);
        return [];
    }
    
    const dateData = getDataForDate(selectedDate);
    console.log(`[PROFESSOR] ==> dateData para ${selectedDate}:`, dateData);
    console.log(`[PROFESSOR] ==> dateData[${activeShift}]:`, dateData[activeShift]);
    console.log(`[PROFESSOR] ==> Tipo de dateData[${activeShift}]:`, typeof dateData[activeShift]);
    console.log(`[PROFESSOR] ==> É array?`, Array.isArray(dateData[activeShift]));
    
    let result = dateData[activeShift] || [];
    
    // Garantir que result é sempre um array válido
    if (!Array.isArray(result)) {
        console.warn(`[PROFESSOR] ==> AVISO: dateData[${activeShift}] não é um array, convertendo:`, result);
        result = [];
    }
    
    // Filtrar dados inválidos
    result = result.filter(item => {
        if (!item || typeof item !== 'object') {
            console.warn(`[PROFESSOR] ==> Item inválido removido:`, item);
            return false;
        }
        return true;
    });
    
    console.log(`[PROFESSOR] ==> Resultado final (${result.length} registros):`, result);
    return result;
}

// Carregar dados do Firebase e localStorage como fallback
async function loadSharedData() {
    console.log('[PROFESSOR] ==> loadSharedData iniciada');
    console.log('[PROFESSOR] ==> selectedDate atual:', selectedDate);
    console.log('[PROFESSOR] ==> activeShift atual:', activeShift);
    
    // Primeiro, tentar carregar dados do Firebase
    let firebaseLoaded = false;
    if (typeof loadTeacherDataFromFirebase === 'function') {
        console.log('[PROFESSOR] 🔥 Tentando carregar dados do Firebase...');
        try {
            firebaseLoaded = await loadTeacherDataFromFirebase(selectedDate);
            if (firebaseLoaded) {
                console.log('[PROFESSOR] ✅ Dados carregados do Firebase com sucesso!');
                
                // Iniciar sincronização em tempo real para todos os turnos
                if (typeof syncTeacherDataRealtime === 'function') {
                    console.log('[PROFESSOR] 🔄 Iniciando sincronização em tempo real...');
                    syncTeacherDataRealtime(selectedDate, 'manhã');
                    syncTeacherDataRealtime(selectedDate, 'tarde');
                    syncTeacherDataRealtime(selectedDate, 'noite');
                }
                
                renderTableForShift(activeShift);
                return;
            }
        } catch (error) {
            console.error('[PROFESSOR] ❌ Erro ao carregar do Firebase:', error);
        }
    }
    
    // Fallback: tentar carregar dados do localStorage se Firebase falhou
    if (!firebaseLoaded) {
        console.log('[PROFESSOR] 📁 Carregando dados do localStorage como fallback...');
        
        const newFormatData = localStorage.getItem('allDateShiftData');
        console.log('[PROFESSOR] Dados brutos do localStorage:', newFormatData);
        
        if(newFormatData) {
            try {
                dataByDateAndShift = JSON.parse(newFormatData);
                console.log('[PROFESSOR] Dados carregados no novo formato:', dataByDateAndShift);
                console.log('[PROFESSOR] Total de datas encontradas:', Object.keys(dataByDateAndShift).length);
                
                // Converter dados para garantir compatibilidade
                dataByDateAndShift = convertAdminDataToTeacherFormat(dataByDateAndShift);
                console.log('[PROFESSOR] Dados convertidos para formato do professor:', dataByDateAndShift);
                
                console.log('[PROFESSOR] ==> Chamando renderTableForShift com activeShift:', activeShift);
                renderTableForShift(activeShift);
                return;
            } catch (e) {
                console.error('[PROFESSOR] Erro ao carregar dados no novo formato:', e);
            }
        } else {
            console.log('[PROFESSOR] Nenhum dado encontrado em allDateShiftData');
        }
    }
    
    // Fallback: tentar carregar dados no formato antigo e migrar
    const oldFormatData = localStorage.getItem('allShiftData');
    if (oldFormatData) {
        try {
            const parsedData = JSON.parse(oldFormatData);
            console.log('Migrando dados do formato antigo...');
            
            // Migrar dados antigos para a data atual
            const dateData = getDataForDate(selectedDate);
            
            if (Array.isArray(parsedData)) {
                // Formato muito antigo
                dateData['manhã'] = parsedData.filter(item => item && item.turno === 'manhã');
                dateData['tarde'] = parsedData.filter(item => item && item.turno === 'tarde');
                dateData['noite'] = parsedData.filter(item => item && item.turno === 'noite');
            } else {
                // Formato intermediário
                dateData['manhã'] = Array.isArray(parsedData['manhã']) ? parsedData['manhã'].filter(Boolean) : [];
                dateData['tarde'] = Array.isArray(parsedData['tarde']) ? parsedData['tarde'].filter(Boolean) : [];
                dateData['noite'] = Array.isArray(parsedData['noite']) ? parsedData['noite'].filter(Boolean) : [];
            }
            
            // Converter dados do formato do painel administrativo para o formato do professor
            console.log('[PROFESSOR] Convertendo dados do formato administrativo...');
            for (let turno in dateData) {
                if (Array.isArray(dateData[turno])) {
                    console.log(`[PROFESSOR] Convertendo ${dateData[turno].length} registros do turno ${turno}`);
                    dateData[turno] = dateData[turno].map(item => {
                        // Se o item já está no formato do professor, manter
                        if (item.sala && item.professor) {
                            return {
                                ...item,
                                // Garantir que tenha ID único
                                id: item.id || item.sala || `record_${Math.random().toString(36).substr(2, 9)}`
                            };
                        }
                        // Se está no formato do painel administrativo, converter
                        else if (item.room && item.professorName) {
                            console.log('[PROFESSOR] Convertendo item do formato admin:', item);
                            return {
                                id: item.id || item.room || `record_${Math.random().toString(36).substr(2, 9)}`,
                                sala: item.room || 'Sala não especificada',
                                professor: item.professorName || 'Professor não especificado',
                                disciplina: item.subject || '-',
                                curso: item.course || '-',
                                turma: item.turmaNumber || '-',
                                horaRetirada: item.withdrawalTime || null,
                                horaDevolucao: item.returnTime || null,
                                // Manter campos originais para compatibilidade
                                room: item.room,
                                professorName: item.professorName,
                                subject: item.subject,
                                course: item.course,
                                turmaNumber: item.turmaNumber,
                                withdrawalTime: item.withdrawalTime,
                                returnTime: item.returnTime,
                                status: item.status || 'disponivel'
                            };
                        }
                        // Fallback para dados mal formatados
                        else {
                            console.log('[PROFESSOR] Usando fallback para item:', item);
                            return {
                                id: item.id || item.sala || item.room || `record_${Math.random().toString(36).substr(2, 9)}`,
                                sala: item.sala || item.room || 'Sala não especificada',
                                professor: item.professor || item.professorName || 'Professor não especificado',
                                disciplina: item.disciplina || item.subject || '-',
                                curso: item.curso || item.course || '-',
                                turma: item.turma || item.turmaNumber || '-',
                                horaRetirada: item.horaRetirada || item.withdrawalTime || null,
                                horaDevolucao: item.horaDevolucao || item.returnTime || null,
                                // Campos de compatibilidade
                                room: item.sala || item.room,
                                professorName: item.professor || item.professorName,
                                subject: item.disciplina || item.subject,
                                course: item.curso || item.course,
                                turmaNumber: item.turma || item.turmaNumber,
                                withdrawalTime: item.horaRetirada || item.withdrawalTime,
                                returnTime: item.horaDevolucao || item.returnTime,
                                status: (item.horaRetirada || item.withdrawalTime) && !(item.horaDevolucao || item.returnTime) ? 'em_uso' : 
                                       (item.horaRetirada || item.withdrawalTime) && (item.horaDevolucao || item.returnTime) ? 'devolvida' : 'disponivel'
                            };
                        }
                    });
                }
            }
            
            // Salvar no novo formato
            localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
            console.log('Dados migrados e estruturados:', dataByDateAndShift);
            renderTableForShift(activeShift);
        } catch (e) {
            console.error('Erro ao carregar dados compartilhados:', e);
            dataByDateAndShift = {};
        }
    } else {
        console.log('Nenhum dado encontrado no localStorage');
    }
}

// Escutar por atualizações de dados
window.addEventListener('shiftDataUpdated', function(event) {
    console.log('[PROFESSOR] Evento de atualização recebido:', event.detail);
    if (event.detail && event.detail.data) {
        // Atualizar estrutura de dados completa
        const oldData = JSON.stringify(dataByDateAndShift);
        
        // Converter dados do formato admin para professor
        dataByDateAndShift = convertAdminDataToTeacherFormat(event.detail.data);
        
        console.log('[PROFESSOR] Dados atualizados de:', oldData);
        console.log('[PROFESSOR] Para:', JSON.stringify(dataByDateAndShift));
        
        // Salvar também no localStorage
        localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
        
        // Não sincronizar data - cada painel navega independentemente
        // Apenas atualizar os dados se estivermos visualizando a data atual
        console.log('[PROFESSOR] Renderizando tabela para data atual:', selectedDate);
        renderTableForShift(activeShift);
    } else {
        console.error('[PROFESSOR] Evento de atualização recebido sem dados válidos:', event);
    }
});

// Listener para detectar mudanças no localStorage (para sincronização entre abas)
window.addEventListener('storage', function(e) {
    if (e.key === 'allDateShiftData' || e.key === 'allShiftData' || e.key === 'dataUpdateTimestamp') {
        console.log('[PROFESSOR] Detectada atualização de dados em outra aba/janela, chave:', e.key);
        console.log('[PROFESSOR] Novo valor:', e.newValue);
        
        if (e.key === 'allDateShiftData' && e.newValue) {
            try {
                const newData = JSON.parse(e.newValue);
                console.log('[PROFESSOR] Dados brutos recebidos via storage:', newData);
                
                // Converter dados do formato admin para professor
                dataByDateAndShift = convertAdminDataToTeacherFormat(newData);
                console.log('[PROFESSOR] Dados convertidos:', dataByDateAndShift);
                
                renderTableForShift(activeShift);
            } catch (error) {
                console.error('[PROFESSOR] Erro ao processar dados do storage:', error);
            }
        } else {
            loadSharedData();
        }
    }
});

// Inicializar o calendário e carregar dados
document.addEventListener('DOMContentLoaded', function() {
    // Cada painel mantém sua própria data selecionada independentemente

    // Configurar seletor de data
    const dateSelector = document.getElementById('teacherDateSelector');
    if (dateSelector) {
        // Definir data atual como padrão
        dateSelector.value = selectedDate;
        
        // Evento de mudança de data
        dateSelector.addEventListener('change', async function() {
            const oldDate = selectedDate;
            selectedDate = this.value;
            console.log(`Data alterada de ${oldDate} para ${selectedDate}`);
            
            // Parar sincronização da data anterior
            if (typeof stopSyncDataRealtime === 'function') {
                console.log('[PROFESSOR] 🛑 Parando sincronização da data anterior...');
                stopSyncDataRealtime(oldDate, 'manhã');
                stopSyncDataRealtime(oldDate, 'tarde');
                stopSyncDataRealtime(oldDate, 'noite');
            }
            
            // Carregar dados da nova data do Firebase
            let firebaseLoaded = false;
            if (typeof loadTeacherDataFromFirebase === 'function') {
                console.log(`[PROFESSOR] 🔥 Carregando dados do Firebase para nova data: ${selectedDate}`);
                try {
                    firebaseLoaded = await loadTeacherDataFromFirebase(selectedDate);
                    if (firebaseLoaded) {
                        console.log('[PROFESSOR] ✅ Dados da nova data carregados do Firebase!');
                        
                        // Iniciar sincronização para a nova data
                        if (typeof syncTeacherDataRealtime === 'function') {
                            console.log('[PROFESSOR] 🔄 Iniciando sincronização para nova data...');
                            syncTeacherDataRealtime(selectedDate, 'manhã');
                            syncTeacherDataRealtime(selectedDate, 'tarde');
                            syncTeacherDataRealtime(selectedDate, 'noite');
                        }
                    }
                } catch (error) {
                    console.error('[PROFESSOR] ❌ Erro ao carregar nova data do Firebase:', error);
                }
            }
            
            // Se não conseguiu carregar do Firebase, verificar localStorage
            if (!firebaseLoaded) {
                console.log('[PROFESSOR] 📁 Verificando localStorage para nova data...');
                const dateData = getDataForDate(selectedDate);
                const shiftData = dateData[activeShift] || [];
                console.log(`Dados encontrados para ${selectedDate} no turno ${activeShift}:`, shiftData);
            }
            
            renderTableForShift(activeShift);
        });
    }

    // Carregar dados iniciais e renderizar
    console.log('[PROFESSOR] ==> Inicializando painel do professor');
    console.log('[PROFESSOR] ==> activeShift inicial:', activeShift);
    console.log('[PROFESSOR] ==> selectedDate inicial:', selectedDate);
    
    renderTabs(); // Garantir que as abas sejam renderizadas
    
    // Carregar dados de forma assíncrona
    loadSharedData().then(() => {
        console.log('[PROFESSOR] ==> Dados carregados, renderizando tabela...');
        renderTableForShift(activeShift);
    }).catch(error => {
        console.error('[PROFESSOR] ==> Erro ao carregar dados:', error);
        renderTableForShift(activeShift); // Tentar renderizar mesmo com erro
    });
    
    // Teste: verificar se há dados no localStorage
    setTimeout(function() {
        console.log('[PROFESSOR] ==> TESTE: Verificando localStorage após 1 segundo...');
        const testData = localStorage.getItem('allDateShiftData');
        if (testData) {
            console.log('[PROFESSOR] ==> TESTE: Dados encontrados no localStorage');
            const parsed = JSON.parse(testData);
            console.log('[PROFESSOR] ==> TESTE: Dados parseados:', parsed);
            
            // Forçar recarregamento
            dataByDateAndShift = convertAdminDataToTeacherFormat(parsed);
            console.log('[PROFESSOR] ==> TESTE: Dados convertidos forçadamente:', dataByDateAndShift);
            renderTableForShift(activeShift);
        } else {
            console.log('[PROFESSOR] ==> TESTE: Nenhum dado encontrado no localStorage');
        }
    }, 1000);
    
    // Verificar periodicamente por atualizações (fallback para sincronização)
    setInterval(function() {
        const currentTimestamp = localStorage.getItem('dataUpdateTimestamp');
        const lastChecked = window.lastDataCheck || '0';
        
        if (currentTimestamp && currentTimestamp !== lastChecked) {
            console.log('[PROFESSOR] Detectada atualização via polling, recarregando dados...');
            window.lastDataCheck = currentTimestamp;
            loadSharedData();
        }
    }, 2000); // Verificar a cada 2 segundos
});

function showAdmLogin() {
    window.location.href = 'paineladm.html';
}

function goToHome() {
    window.location.href = 'index.html';
}

function hideAdmLogin() {
    document.getElementById('overlay').style.visibility = 'hidden';
}

// ---------- Botão de Ação ----------
function getActionButton(recordId, record) {
    // Verificar se a chave está em uso usando campos do professor
    const isInUse = (record.horaRetirada && !record.horaDevolucao) || 
                    (record.withdrawalTime && !record.returnTime)  ||
                    record.status === 'em_uso';
    
    if(isInUse) {
        // Já retirada - opção de devolver
        return `
            <button 
                class="btn action-btn devolver"
                onclick="handleKey('${record.id || record.sala}', 'return')"
            >
                <i class="bi bi-arrow-return-left me-1"></i>
                Devolver
            </button>
        `;
    } else {
        // Disponível - opção de retirar
        return `
            <button 
                class="btn action-btn retirar"
                onclick="handleKey('${record.id || record.sala}', 'remove')"
            >
                <i class="bi bi-key me-1"></i>
                Retirar
            </button>
        `;
    }
}

function getStatusBadgeTP(record) {
    if (!record || typeof record !== 'object') {
        return `<span class="status-badge disponivel">Disponível</span>`;
    }

    let status = 'disponivel';
    let label = 'Disponível';

    // Verificar status usando campos do professor
    if (record.horaRetirada) {
        if (!record.horaDevolucao) {
            status = 'em_uso';
            label = 'Em Uso';
        } else {
            status = 'devolvida';
            label = 'Devolvida';
        }
    }
    // Verificar status usando campos do administrador se os do professor não estiverem disponíveis
    else if (record.withdrawalTime) {
        if (!record.returnTime) {
            status = 'em_uso';
            label = 'Em Uso';
        } else {
            status = 'devolvida';
            label = 'Devolvida';
        }
    }
    // Verificar status direto se disponível
    else if (record.status) {
        status = record.status;
        switch (record.status) {
            case 'em_uso':
                label = 'Em Uso';
                break;
            case 'devolvida':
                label = 'Devolvida';
                break;
            case 'retirada':
                label = 'Retirada';
                break;
            default:
                label = 'Disponível';
        }
    }

    return `<span class="status-badge ${status}">${label}</span>`;
}

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, iniciando...');
    initialize(); // Usar a função de inicialização única
});

// ---------- Renderização ----------
function renderTabs() {
    const tabs = [
        { id:'manhã', label:'Manhã' },
        { id:'tarde', label:'Tarde' },
        { id:'noite', label:'Noite' },
    ];

    const el = document.getElementById('shiftTabs');

    el.innerHTML = tabs.map(t => `
        <button class="tab ${(t.id === activeShift) ? 'active' : ''}" onclick="switchShift('${t.id}')">
            ${t.label}
        </button>
    `).join('');
}

function sorted(data) {
    if (!Array.isArray(data)) {
        console.error('Dados inválidos para ordenação:', data);
        return [];
    }

    try {
        const validData = data.filter(item => item && typeof item === 'object');
        if (validData.length !== data.length) {
            console.warn('Alguns itens foram removidos por serem inválidos:', data);
        }

        // Sempre ordenar alfabeticamente por professor para manter consistência com painel administrativo
        return validData.sort((a, b) => {
            const professorA = (a.professor || '').trim();
            const professorB = (b.professor || '').trim();
            if (!professorA || !professorB) return 0;
            return professorA.localeCompare(professorB, 'pt-BR');
        });
    } catch (error) {
        console.error('Erro ao ordenar dados:', error);
        return [];
    }
}

function renderTableForShift(shift) {
    console.log('[PROFESSOR] ==> Renderizando dados para o turno:', shift, 'na data:', selectedDate);
    console.log('[PROFESSOR] ==> Estado atual de dataByDateAndShift:', dataByDateAndShift);
    
    const container = document.getElementById('shiftContent');
    if (!container) {
        console.error('[PROFESSOR] ==> Elemento shiftContent não encontrado!');
        return;
    }
    
    // Usar dados da data e turno selecionados
    let shiftData = getCurrentShiftData();
    console.log('[PROFESSOR] ==> Dados brutos obtidos de getCurrentShiftData():', shiftData);
    console.log('[PROFESSOR] ==> Tipo dos dados:', typeof shiftData, 'É array?', Array.isArray(shiftData));
    
    if (!Array.isArray(shiftData)) {
        console.warn('[PROFESSOR] ==> Dados do turno não são um array:', shift);
        shiftData = [];
    }
    
    console.log('[PROFESSOR] ==> Dados antes da conversão:', shiftData.length, 'itens');
    
    // PRIMEIRO: Converter dados do formato admin para professor se necessário
    shiftData = shiftData.map(item => {
        if (!item || typeof item !== 'object') return item;
        
        // Garantir que cada registro tenha um ID único
        if (!item.id) {
            item.id = item.sala || item.room || `record_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // Se está no formato admin (room, professorName), converter
        if (item.room && item.professorName && !item.sala && !item.professor) {
            console.log('[PROFESSOR] ==> Convertendo item do formato admin:', item);
            return {
                id: item.id,
                sala: item.room || 'Sala não especificada',
                professor: item.professorName || 'Professor não especificado',
                disciplina: item.subject || '-',
                curso: item.course || '-',
                turma: item.turmaNumber || '-',
                horaRetirada: item.withdrawalTime || null,
                horaDevolucao: item.returnTime || null,
                // Manter campos originais para compatibilidade
                room: item.room,
                professorName: item.professorName,
                subject: item.subject,
                course: item.course,
                turmaNumber: item.turmaNumber,
                withdrawalTime: item.withdrawalTime,
                returnTime: item.returnTime,
                status: item.status || 'disponivel'
            };
        }
        
        // Se já está no formato professor ou é outro formato, manter
        return item;
    });
    
    console.log('[PROFESSOR] ==> Dados após conversão:', shiftData);
    console.log('[PROFESSOR] ==> Dados antes da filtragem:', shiftData.length, 'itens');
    
    // SEGUNDO: Filtrar dados inválidos
    const originalLength = shiftData.length;
    shiftData = shiftData.filter(item => {
        if (!item || typeof item !== 'object') {
            console.log('[PROFESSOR] ==> Item rejeitado (não é objeto):', item);
            return false;
        }
        // Garantir que pelo menos a sala e o professor existem
        const valid = item.sala && typeof item.sala === 'string' &&
               item.professor && typeof item.professor === 'string' &&
               item.sala.trim() !== '' && item.professor.trim() !== '';
        
        if (!valid) {
            console.log('[PROFESSOR] ==> Item rejeitado (dados inválidos):');
            console.log('[PROFESSOR] ==> - Objeto completo:', item);
            console.log('[PROFESSOR] ==> - Propriedades do objeto:', Object.keys(item));
            console.log('[PROFESSOR] ==> - item.sala:', item.sala, '(tipo:', typeof item.sala, ')');
            console.log('[PROFESSOR] ==> - item.professor:', item.professor, '(tipo:', typeof item.professor, ')');
            console.log('[PROFESSOR] ==> - item.room:', item.room, '(tipo:', typeof item.room, ')');
            console.log('[PROFESSOR] ==> - item.professorName:', item.professorName, '(tipo:', typeof item.professorName, ')');
        }
        return valid;
    });
    
    console.log('[PROFESSOR] ==> Dados após filtragem:', shiftData.length, 'de', originalLength, 'itens');
    console.log('[PROFESSOR] ==> Dados filtrados:', shiftData);
    const records = sorted(shiftData);

    console.log('Gerando linhas para os registros:', records);
    
    // Se não há dados, mostrar mensagem
    let rows = '';
    if (records.length === 0) {
        const [year, month, day] = selectedDate.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        const shiftCapitalized = shift.charAt(0).toUpperCase() + shift.slice(1);
        
        rows = `
            <tr>
                <td colspan="9" class="text-center text-muted py-4">
                    <i class="bi bi-calendar-x me-2"></i>
                    Nenhum dado encontrado para ${formattedDate} no turno da ${shiftCapitalized.toLowerCase()}
                    <br>
                    <small class="text-muted">Aguarde a importação de dados pelo administrador</small>
                </td>
            </tr>
        `;
    } else {
        rows = records.map(record => {
        // Sanitizar valores para garantir que não são undefined
        const sala = record.sala || '-';
        const curso = record.curso || '-';
        const turma = record.turma || '-';
        const professor = record.professor || '-';
        const disciplina = record.disciplina || '-';
        const horaRetirada = record.horaRetirada || '-';
        const horaDevolucao = record.horaDevolucao || '-';
        
        // Garantir que cada registro tenha um ID único
        if (!record.id) {
            record.id = record.sala || `record_${Math.random().toString(36).substr(2, 9)}`;
        }

        return `
        <tr>
            <td>${sala}</td>
            <td>${curso}</td>
            <td>${turma}</td>
            <td class="fw-medium">
                <i class="bi bi-person-circle table-icon"></i>
                ${professor}
            </td>
            <td>
                <i class="bi bi-book table-icon"></i>
                ${disciplina}
            </td>
            <td>${horaRetirada}</td>
            <td>${horaDevolucao}</td>
            <td>${getStatusBadgeTP(record)}</td>
            <td class="text-center">
                ${getActionButton(record.id, record)}
            </td>
        </tr>
        `;
        }).join('');
    }

    // Corrigir problema de fuso horário ao exibir a data
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    
    container.innerHTML = `
        <div class="card-header d-flex align-items-center justify-content-between">
            <h2 class="card-title">
                <i class="bi bi-clock"></i>
                Turno da ${shift}
            </h2>
            <span class="text-muted">
                <i class="bi bi-calendar3 me-1"></i>
                ${formattedDate}
            </span>
        </div>
        <div class="card-body p-0">
        
            <div class="table-responsive">
                <table class="table table-hover mb-0">
                    <thead class="table-light">
                        <tr>
                            <th class="border-0">Sala</th>
                            <th class="border-0">Curso</th>
                            <th class="border-0">Turma</th>
                            <th class="border-0">Professor</th>
                            <th class="border-0">Disciplina</th>
                            <th class="border-0">Hora Inicial</th>
                            <th class="border-0">Hora Final</th>
                            <th class="border-0">Status</th>
                            <th class="border-0 text-center">Devolução</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        ${rows || ''}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ----------- Ações da chave -----------
function handleKey(recordId, action) {
    const currentData = getCurrentShiftData();
    // Tentar encontrar por ID primeiro, depois por sala
    const record = currentData.find(r => r.id === recordId) || 
                   currentData.find(r => r.sala === recordId) ||
                   currentData.find(r => r.curso === recordId) ||
                   currentData.find(r => r.horaDevolucao === recordId);
    
    if(!record) {
        console.error('Registro não encontrado:', recordId);
        return;
    }

    if(action === 'remove' && record.horaDevolucao) {
        showMensageConfirmationModal();
        return;
    }

    document.getElementById('btn-retirar-chave').innerText = (action === 'remove') ? 'Retirar a chave' : 'Devolver a chave';

    // Para ações de remoção por professores, abrir modal de login para validação FATS4796
    if((action === 'remove' || action === 'return') && record.curso != "Terceiros") {
        activeAction = { record, action };
        openLogin();
        return;
    }

    // Para outras ações (ex.: devolução) e para remoção de chaves por terceiros, executar diretamente
    executeKeyAction(record, action);
}

// Função para criar e mostrar modal de mensagem
//titleMessage, message, recordId, row
function showMensageConfirmationModal() {
    // Remove modal existente
    document.getElementById('messageConfirmationModal')?.remove();
    
    // Cria o modal
    const modal = document.createElement('div');
    modal.id = 'messageConfirmationModal';
    modal.className = 'modal fade';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-hidden', 'true');

    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered" style="z-index: 2000 !important;">
            <div class="modal-content border-0 shadow-lg">
                
                <!-- Cabeçalho -->
                <div class="modal-header bg-primary text-white border-0 justify-content-center position-relative">
                    <div class="d-flex justify-content-center align-items-center position-absolute" style="width: 100px; height: 100px; border-radius: 50%; background-color: #0d6efd; top: -28px;">
                        <i class="bi bi-exclamation-triangle-fill text-white" style="font-size: 3.2rem;"></i>                        
                    </div>
                    <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>

                <!-- Corpo -->
                <div class="modal-body p-4 text-center">
                    <h3 class="mb-3 mt-4" style="color: #323232;">
                        Retirada não permitida!
                    </h3>
                    <p class="text-center mb-1 mx-auto" style="color: #4D4D4D; max-width: 380px;">
                        Não é possível retirar a chave novamente após a devolução!
                    </p>
                </div>
                
                <!-- Rodapé (ações) -->
                <div class="modal-footer border-0 mb-1 d-flex">
                    <button type="button" class="btn" id="confirmMessageBtn" style="margin: 0 28px;">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;    
    document.body.appendChild(modal);

    const bootstrapModal = new bootstrap.Modal(modal);

    // Event listener para confirmação
    modal.querySelector('#confirmMessageBtn').addEventListener('click', function() {
        bootstrapModal.hide();
    });
    
    // Limpa tudo ao fechar
    modal.addEventListener('hidden.bs.modal', () => modal.remove());
    bootstrapModal.show();
}


function executeKeyAction(record, action) {
    const now = new Date();
    const hm = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const currentShiftData = getCurrentShiftData();
    
    // DEBUG: Validar dados antes de prosseguir
    console.log('🔍 [DEBUG] executeKeyAction - Dados iniciais:');
    console.log('🔍 [DEBUG] - record:', record);
    console.log('🔍 [DEBUG] - action:', action);
    console.log('🔍 [DEBUG] - currentShiftData length:', currentShiftData.length);
    console.log('🔍 [DEBUG] - currentShiftData:', currentShiftData);
    
    // Validar se currentShiftData é válido
    if (!Array.isArray(currentShiftData)) {
        console.error('❌ [DEBUG] currentShiftData não é um array válido:', currentShiftData);
        return;
    }
    
    if (currentShiftData.length === 0) {
        console.warn('⚠️ [DEBUG] currentShiftData está vazio - isso pode causar problemas no Firebase');
    }
    
    // Tentar encontrar por ID primeiro, depois por sala
    let recordIndex = currentShiftData.findIndex(r => r.id === record.id);
    if (recordIndex === -1) {
        recordIndex = currentShiftData.findIndex(r => r.sala === record.sala);
    }
    if (recordIndex === -1) {
        recordIndex = currentShiftData.findIndex(r => r.curso === record.curso);
    }
    
    console.log('🔍 [DEBUG] recordIndex encontrado:', recordIndex);
    
    if (recordIndex !== -1) {
        if (action === 'remove') {

            // if(currentShiftData[recordIndex].horaDevolucao != '-') {
            //     showMensageConfirmationModal();
            //     return;
            // } 
            // Atualizar campos do professor
            currentShiftData[recordIndex].horaRetirada = hm;
            currentShiftData[recordIndex].horaDevolucao = undefined;
            
            // Atualizar campos do administrador para compatibilidade
            currentShiftData[recordIndex].withdrawalTime = hm;
            currentShiftData[recordIndex].returnTime = '';
            currentShiftData[recordIndex].status = 'em_uso';
            
            // Mostrar notificação de sucesso
            showNotification(`Chave retirada por ${record.professor} às ${hm}`, 'success');
        } else if (action === 'return') {
            // Atualizar campos do professor
            currentShiftData[recordIndex].horaDevolucao = hm;
            
            // Atualizar campos do administrador para compatibilidade
            currentShiftData[recordIndex].returnTime = hm;
            currentShiftData[recordIndex].status = 'devolvida';
            
            // Mostrar notificação de sucesso
            showNotification(`Chave devolvida por ${record.professor} às ${hm}`, 'info');
        }

        // IMPORTANTE: Atualizar a estrutura dataByDateAndShift com os dados modificados
        dataByDateAndShift[selectedDate][activeShift] = currentShiftData;

        // Adicionar metadados de sincronização
        const completeTableData = {
            timestamp: Date.now(),
            lastModified: now.toISOString(),
            shift: activeShift,
            date: selectedDate,
            totalRecords: currentShiftData.length,
            modifiedRecordId: record.id || record.sala,
            action: action,
            data: currentShiftData
        };

        // Atualizar o localStorage com os novos dados
        localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
        
        // Marcar timestamp de atualização para sincronização entre abas
        localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
        
        // Disparar evento de atualização para sincronizar com o painel administrativo
        window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
            detail: completeTableData
        }));
        
        // Salvar TODA A TABELA no Firebase para persistência e sincronização em tempo real
        if(typeof saveDataToFirebase === 'function') {
            // DEBUG: Log detalhado dos dados antes de enviar ao Firebase
            console.log('🔥 [DEBUG] Dados antes de enviar ao Firebase:');
            console.log('🔥 [DEBUG] - selectedDate:', selectedDate);
            console.log('🔥 [DEBUG] - activeShift:', activeShift);
            console.log('🔥 [DEBUG] - currentShiftData length:', currentShiftData.length);
            console.log('🔥 [DEBUG] - currentShiftData completo:', currentShiftData);
            console.log('🔥 [DEBUG] - dataByDateAndShift[selectedDate]:', dataByDateAndShift[selectedDate]);
            
            // Garantir que enviamos a tabela completa, não apenas o registro modificado
            saveDataToFirebase(selectedDate, activeShift, currentShiftData).then(() => {                
                console.log('✅ [DEBUG] Dados salvos no Firebase com sucesso!');
                // Notificar admin panel que a tabela completa foi atualizada
                if(typeof notifyAdminPanelUpdate === 'function') {
                    notifyAdminPanelUpdate(completeTableData);
                }
            }).catch(error => {
                console.error('❌ [DEBUG] Erro ao salvar TABELA COMPLETA no Firebase:', error);
                console.error('❌ [DEBUG] Dados que falharam:', {
                    date: selectedDate,
                    shift: activeShift,
                    recordCount: currentShiftData.length,
                    dataSample: currentShiftData.slice(0, 2) // Mostrar apenas os primeiros 2 registros
                });
            });
        } else {
            console.warn('⚠️ [DEBUG] Função saveDataToFirebase não disponível');
        }
        
        // Também salvar no formato antigo para compatibilidade
        const currentDateData = getDataForDate(selectedDate);
        localStorage.setItem('allShiftData', JSON.stringify(currentDateData));

        // Forçar sincronização com painel admin se disponível
        if(typeof syncWithAdminPanel === 'function') {
            syncWithAdminPanel(completeTableData);
        }

        // Verificar se os dados foram realmente salvos
        setTimeout(() => {
            verifyDataSyncronization(selectedDate, activeShift, currentShiftData);
        }, 1000);
        
    } else {
        console.warn('| ERRO: Registro não encontrado para ação:', {
            recordId: record.id,
            sala: record.sala,
            action: action
        });
    }

    renderTableForShift(activeShift);
}

// Função auxiliar para verificar se os dados foram sincronizados corretamente
function verifyDataSyncronization(date, shift, expectedData) {
    if(typeof getFirebaseData === 'function') {
        getFirebaseData(date, shift).then(firebaseData => {
            if(firebaseData && firebaseData.length === expectedData.length) {
                console.log('| Dados sincronizados corretamente no firebase');
            } else {
                console.warn('| ERRO: problema na sincronização:', {
                    expected: expectedData.length,
                    firebase: firebaseData ? firebaseData.length : 0
                });
            }
        }).catch(error => {
            console.error('| Erro ao verificar sincronização:', error);
        });
    }
}

// Função auxiliar para notificar o painel administrativo sobre atualizações
function notifyAdminPanelUpdate(completeTableData) {
    // Enviar via WebSocket se disponível
    if(typeof sendWebSocketMessage === 'function') {
        sendWebSocketMessage('COMPLETE_TABLE_UPDATE', completeTableData);
    }
    
    // Ou via custom event para comunicação entre componentes
    window.dispatchEvent(new CustomEvent('adminPanelTableUpdate', {
        detail: completeTableData
    }));
    
    console.log('Sucesso em notificar paineladm');
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Adicionar ao body
    document.body.appendChild(notification);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ----------- Login modal -----------
function openLogin() { 
    // Limpar mensagens de erro anteriores
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value = '';
    
    // Mostrar informações sobre a ação
    if(activeAction && activeAction.record) {
        const record = activeAction.record;
        const professorName = record.professor;
        const expectedFastId = docentesCodprof[professorName];
        
        // Atualizar o título do modal para mostrar qual professor
        const modalTitle = document.getElementById('loginModalTitle');
        
        if(modalTitle) {
            modalTitle.textContent = `Validação - ${professorName}`;
        }
        
        const helpMessage = document.getElementById('msg-erro');

        if(helpMessage) {
            helpMessage.innerHTML = `<p class="text-info-fast">Digite o FAST ID correspondente ao professor: <br> <strong>${professorName}</strong></p>`;
        }
    }
    
    document.getElementById('loginModal').style.display = 'flex';
    
    // Foca no campo de input e adiciona event listener ao pressionar Enter
    setTimeout(() => {
        const fastInput = document.getElementById('loginFast');

        if(fastInput) {
            fastInput.focus();
            
            // Adicionar event listener para Enter
            const handleEnter = (e) => {
                if(e.key === 'Enter') {
                    confirmLogin();
                }
            };
            
            fastInput.addEventListener('keypress', handleEnter);
            
            // Armazenar o handler para remoção posterior
            fastInput._enterHandler = handleEnter;
        }
    }, 100);
}

function closeLogin() { 
    document.getElementById('loginModal').style.display = 'none'; 
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value = '';
    
    // Remover event listener do Enter
    const fastInput = document.getElementById('loginFast');

    if(fastInput && fastInput._enterHandler) {
        fastInput.removeEventListener('keypress', fastInput._enterHandler);
        delete fastInput._enterHandler;
    }
    
    activeAction = null; 
}

// Faz o que for digitado no campo de fast ser convertido para UPPERCASE automáticamente
const inputFast = document.getElementById("loginFast");

inputFast.addEventListener("input", () => {
    inputFast.value = inputFast.value.toUpperCase();
});

// Função para confirmar login
function confirmLogin() {
    const fastId = (document.getElementById('loginFast').value || '').trim();

    if(!fastId) {
        document.getElementById('msg-erro').textContent = 'Por favor, preencha o FAST ID!';
        return; 
    }

    const record = activeAction ? activeAction.record : null;

    if(!record) {
        document.getElementById('msg-erro').textContent = 'Erro: Registro não encontrado.';
        return;
    }

    // Validar se o FAST ID corresponde ao nome do professor
    const professorName = record.professor;
    const expectedFastId = docentesCodprof[professorName];

    if(!expectedFastId) {
        document.getElementById('msg-erro').textContent = 'Erro: Professor não encontrado na base de dados.';
        return;
    }

    if(fastId !== expectedFastId) {
        document.getElementById('msg-erro').textContent = 'FAST ID incorreto para este professor.';
        return;
    }

    // Validação bem-sucedida - fechar modal e executar ação
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value = ''; 

    if(activeAction) { 
        executeKeyAction(activeAction.record, activeAction.action); 
        activeAction = null; 
    }
}

// ----------- Terceiros modal -----------
function openThirdPartyForm() { 
    document.getElementById('thirdPartyModal').classList.add('active'); 
}

function closeThirdPartyForm() {
    document.getElementById('thirdPartyModal').classList.remove('active'); 
    document.getElementById('tpFullName').value = '';
    document.getElementById('tpPurpose').value = '';
    
    // Resetar seleção múltipla e modo
    selectedKeys = [];
    multipleSelectionMode = false;
    currentKeyMode = null;
    
    // Limpar seleções atuais
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    hideMultipleSelectionSection();
    
    // Voltar para a pergunta inicial
    document.getElementById('key-quantity-section').classList.remove('hidden');
    document.getElementById('key-quantity-section').classList.add('visible');
    document.getElementById('block-dropdown').classList.remove('visible');
    document.getElementById('block-dropdown').classList.add('hidden');
    document.getElementById('room-dropdown').classList.remove('visible');
    document.getElementById('room-dropdown').classList.add('hidden');
    document.getElementById('room-number-dropdown').classList.remove('visible');
    document.getElementById('room-number-dropdown').classList.add('invisible');
    
    // Resetar estilos inline que podem ter sido aplicados
    document.getElementById('room-dropdown').style.display = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    resetAllDropdowns();
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
        indicator.innerHTML = '<i class="bi bi-key"></i> Modo Ativo';
        indicator.className = 'badge bg-primary';
    }
    
    updateSelectedKeysCount();
}

// ----------- Dropdowns -----------
const dropdown = {
  "Bloco A": [
    { sala: "HIDRÁULICA",  numeros: [] },
    { sala: "AUT PREDIAL", numeros: [] }
  ],

  "Bloco B": [
    { sala: "QUÍMICA",     numeros: [] }
  ],

  "Bloco C": [
    { sala: "FABRICAÇÃO",  numeros: [] }
  ],

  "Bloco D": [
    { sala: "PLANTA CIM",  numeros: [] },
    { sala: "METROLOGIA",  numeros: [] },
    { sala: "LAB MAKER",   numeros: [] }
  ],

  "Bloco E": [
    { sala: "SALAS TÉRREO", numeros: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16] }
  ],

  "Bloco F": [
    { sala: "LAB DE INFORMÁTICA", numeros: [1,2,3,4,5,6,7,8,9,10] },
    { sala: "LAB ELETROTÉCNICA",  numeros: [11] },
    { sala: "SALAS - 2º ANDAR",   numeros: [12,14,16,17,18,19,20] },
    { sala: "LAB ACIONAMENTOS",   numeros: [13] },
    { sala: "LAB ELETRÔNICA",     numeros: [15] }
  ],

  "Bloco G": [
    { sala: "ARMAZENAGEM",        numeros: [] },
    { sala: "SALA DE AUTOMOTIVA", numeros: [] },
    { sala: "MOTOCICLETAS",       numeros: [] },
    { sala: "FUNILARIA",          numeros: [] },
    { sala: "PREDIAL II",         numeros: [] }
  ],

  "Bloco H": [
    { sala: "SALA EMPILHADEIRA", numeros: [] },
    { sala: "MICROBIOLOGIA",     numeros: [] },
    { sala: "PANIFICAÇÃO",       numeros: [] }
  ]
};

// Variável de seleção atual para o funcionamento dos dropdowns (cascata)
let currentSelections = {
    block: null,
    room: null,
    roomNumber: null
};

// Funções para controlar o modo de seleção de chaves
function selectKeyMode(mode) {
    currentKeyMode = mode;
    
    // Limpar seleções anteriores
    selectedKeys = [];
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Esconder a seção de quantidade de chaves
    document.getElementById('key-quantity-section').classList.remove('visible');
    document.getElementById('key-quantity-section').classList.add('hidden');
    
    // Esconder seção de seleção múltipla (será mostrada depois se necessário)
    hideMultipleSelectionSection();
    
    // Mostrar seleção de bloco
    document.getElementById('block-dropdown').classList.remove('hidden');
    document.getElementById('block-dropdown').classList.add('visible');
    
    // Atualizar indicador visual do modo
    updateModeIndicator(mode);
    
    // Configurar modo
    if (mode === 'multiple') {
        multipleSelectionMode = true;
        // No modo múltiplo, esconder dropdowns de sala e número da sala
        document.getElementById('room-dropdown').style.display = 'none';
        document.getElementById('room-number-dropdown').style.display = 'none';
    } else {
        multipleSelectionMode = false;
        // No modo single, garantir que dropdowns estejam disponíveis
        document.getElementById('room-dropdown').style.display = '';
        document.getElementById('room-number-dropdown').style.display = '';
        // Esconder esses dropdowns inicialmente
        document.getElementById('room-dropdown').classList.remove('visible');
        document.getElementById('room-dropdown').classList.add('hidden');
        document.getElementById('room-number-dropdown').classList.remove('visible');
        document.getElementById('room-number-dropdown').classList.add('invisible');
    }
    
    // Resetar e popular o primeiro dropdown
    resetAllDropdowns();
}

function updateModeIndicator(mode) {
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
        if (mode === 'single') {
            indicator.innerHTML = '<i class="bi bi-key"></i> Chave Específica';
            indicator.className = 'badge bg-primary';
        } else if (mode === 'multiple') {
            indicator.innerHTML = '<i class="bi bi-key-fill"></i> Múltiplas Chaves';
            indicator.className = 'badge bg-success';
        }
    }
}

function goBackToKeyQuantity() {
    // Resetar tudo
    currentKeyMode = null;
    multipleSelectionMode = false;
    selectedKeys = [];
    
    // Limpar seleções atuais
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Mostrar novamente a pergunta inicial
    document.getElementById('key-quantity-section').classList.remove('hidden');
    document.getElementById('key-quantity-section').classList.add('visible');
    
    // Esconder todas as outras seções
    hideMultipleSelectionSection();
    document.getElementById('block-dropdown').classList.remove('visible');
    document.getElementById('block-dropdown').classList.add('hidden');
    document.getElementById('room-dropdown').classList.remove('visible');
    document.getElementById('room-dropdown').classList.add('hidden');
    document.getElementById('room-number-dropdown').classList.remove('visible');
    document.getElementById('room-number-dropdown').classList.add('invisible');
    
    // Resetar estilos inline que podem ter sido aplicados
    document.getElementById('room-dropdown').style.display = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    // Resetar dropdowns
    resetAllDropdowns();
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
        indicator.innerHTML = '<i class="bi bi-key"></i> Modo Ativo';
        indicator.className = 'badge bg-primary';
    }
    
    // Atualizar contador de chaves selecionadas
    updateSelectedKeysCount();
}

// Funções para seleção múltipla de chaves
function showMultipleSelectionSection() {
    const section = document.getElementById('multiple-selection-section');
    section.classList.remove('invisible');
    section.classList.add('visible');
    multipleSelectionMode = true;
    populateAvailableKeys();
}

function hideMultipleSelectionSection() {
    const section = document.getElementById('multiple-selection-section');
    section.classList.remove('visible');
    section.classList.add('invisible');
    multipleSelectionMode = false;
    selectedKeys = [];
    updateSelectedKeysCount();
}

function populateAvailableKeys() {
    const container = document.getElementById('available-keys-container');
    const block = currentSelections.block;
    
    if (!block) {
        container.innerHTML = '<div class="empty-keys-message">Selecione um bloco primeiro</div>';
        return;
    }

    // Atualizar o nome do bloco no título
    document.getElementById('selected-block-name').textContent = block;

    // Obter dados atuais para verificar disponibilidade
    const dateData = getDataForDate(selectedDate);
    const currentShiftData = dateData[activeShift] || [];
    
    container.innerHTML = '';
    
    if (currentKeyMode === 'multiple') {
        // Modo múltiplo: mostrar todas as chaves do bloco
        const blockRooms = dropdown[block];
        
        if (!blockRooms || blockRooms.length === 0) {
            container.innerHTML = '<div class="empty-keys-message">Nenhuma sala encontrada neste bloco</div>';
            return;
        }
        
        blockRooms.forEach(roomObj => {
            const room = roomObj.sala;
            const numbers = roomObj.numeros || [];
            
            if (numbers.length === 0) {
                // Sala sem numeração - apenas uma chave
                const salaIdentifier = `${block} - ${room}`;
                const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
                
                const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                    block: block,
                    room: room,
                    roomNumber: null
                });
                container.appendChild(keyItem);
            } else {
                // Sala com numeração - múltiplas chaves
                numbers.forEach(number => {
                    const salaIdentifier = `${block} - ${room} - Sala ${number}`;
                    const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
                    
                    const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                        block: block,
                        room: room,
                        roomNumber: number
                    });
                    container.appendChild(keyItem);
                });
            }
        });
    } else {
        // Modo single: funcionalidade original (baseada em room selecionada)
        const room = currentSelections.room;
        
        if (!room) {
            container.innerHTML = '<div class="empty-keys-message">Selecione uma sala primeiro</div>';
            return;
        }

        // Encontrar as salas/números disponíveis
        const roomObj = dropdown[block].find(r => r.sala === room);
        const numbers = roomObj ? roomObj.numeros : [];
        
        if (numbers.length === 0) {
            // Sala sem numeração - apenas uma chave
            const salaIdentifier = `${block} - ${room}`;
            const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
            
            const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                block: block,
                room: room,
                roomNumber: null
            });
            container.appendChild(keyItem);
        } else {
            // Sala com numeração - múltiplas chaves
            numbers.forEach(number => {
                const salaIdentifier = `${block} - ${room} - Sala ${number}`;
                const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
                
                const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                    block: block,
                    room: room,
                    roomNumber: number
                });
                container.appendChild(keyItem);
            });
        }
    }
    
    updateSelectedKeysCount();
}

function createKeySelectionItem(salaIdentifier, isInUse, roomDetails) {
    const item = document.createElement('div');
    item.className = `key-selection-item ${isInUse ? 'unavailable' : ''}`;
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.disabled = isInUse;
    checkbox.value = salaIdentifier;
    checkbox.addEventListener('change', () => toggleKeySelection(salaIdentifier, roomDetails, checkbox.checked));
    
    const keyInfo = document.createElement('div');
    keyInfo.className = 'key-info';
    
    const keyName = document.createElement('div');
    keyName.className = 'key-name';
    keyName.textContent = salaIdentifier;
    
    const keyStatus = document.createElement('div');
    keyStatus.className = `key-status ${isInUse ? 'in-use' : 'available'}`;
    keyStatus.textContent = isInUse ? 'Em uso' : 'Disponível';
    
    keyInfo.appendChild(keyName);
    keyInfo.appendChild(keyStatus);
    
    item.appendChild(checkbox);
    item.appendChild(keyInfo);
    
    if (!isInUse) {
        item.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                toggleKeySelection(salaIdentifier, roomDetails, checkbox.checked);
            }
        });
    }
    
    return item;
}

function toggleKeySelection(salaIdentifier, roomDetails, isSelected) {
    if (isSelected) {
        if (!selectedKeys.find(key => key.identifier === salaIdentifier)) {
            selectedKeys.push({
                identifier: salaIdentifier,
                roomDetails: roomDetails
            });
        }
    } else {
        selectedKeys = selectedKeys.filter(key => key.identifier !== salaIdentifier);
    }
    
    updateSelectedKeysCount();
    updateKeyItemAppearance();
}

function updateKeyItemAppearance() {
    const items = document.querySelectorAll('.key-selection-item');
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function updateSelectedKeysCount() {
    const countElement = document.getElementById('selected-count');
    if (countElement) {
        countElement.textContent = selectedKeys.length;
    }
}

function selectAllAvailableKeys() {
    const checkboxes = document.querySelectorAll('.key-selection-item:not(.unavailable) input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;
            const item = checkbox.closest('.key-selection-item');
            const salaIdentifier = checkbox.value;
            
            // Extrair detalhes da sala a partir do identificador
            const parts = salaIdentifier.split(' - ');
            const roomDetails = {
                block: parts[0],
                room: parts[1],
                roomNumber: parts[2] ? parts[2].replace('Sala ', '') : null
            };
            
            toggleKeySelection(salaIdentifier, roomDetails, true);
        }
    });
}

function clearAllSelectedKeys() {
    const checkboxes = document.querySelectorAll('.key-selection-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedKeys = [];
    updateSelectedKeysCount();
    updateKeyItemAppearance();
}

// Função Salvar Terceiros
function saveThirdParty() {
    const name = document.getElementById('tpFullName').value.trim();
    const purpose = document.getElementById('tpPurpose').value.trim();

    // Valida se os campos obrigatórios estão vazios
    if(!name || !purpose) {
        showNotification('Preencha corretamente os campos obrigatórios.', 'warning');
        return; 
    }

    // Verificar se um modo foi selecionado
    if(!currentKeyMode) {
        showNotification('Selecione o tipo de chave (específica ou múltipla).', 'warning');
        return;
    }

    // Verificar se estamos em modo de seleção múltipla
    if(currentKeyMode === 'multiple') {
        if(selectedKeys.length === 0) {
            showNotification('Selecione pelo menos uma chave.', 'warning');
            return;
        }
        // Salvar múltiplas chaves
        saveMultipleThirdPartyKeys(name, purpose);
    } else {
        // Salvar chave única (modo tradicional)
        saveSingleThirdPartyKey(name, purpose);
    }
}

function saveSingleThirdPartyKey(name, purpose) {
    // Recupera as opções do dropdown selecionadas
    const block = currentSelections.block;
    const room = currentSelections.room;
    const roomNumber = currentSelections.roomNumber;

    // Valida se os campos obrigatórios estão vazios
    if(!block) {
        showNotification('Selecione um bloco.', 'warning');
        return; 
    }
    
    if(!room) {
        showNotification('Selecione uma sala.', 'warning');
        return; 
    }

    // Encontra o objeto <sala> para recuperar o vetor de <numeros>
    const roomObj = dropdown[block].find(r => r.sala === room);
    const numbers = roomObj ? roomObj.numeros : [];

    // Valida se a sala selecionada há números e, caso tenha, se algum foi selecionado
    if(numbers.length > 0 && !roomNumber) {
        showNotification('Selecione o número da sala para completar o cadastro!', 'warning');
        return;
    }

    const timeString = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', 
                                                                minute: '2-digit' 
    });
    
    // Variável que contém a forma de exibição da alocação
    let salaIdentifier = `${block} - ${room}`;

    if(roomNumber) {
        salaIdentifier += ` - Sala ${roomNumber}`;
    }
    
    // Dados do terceiro
    const newRecord = createThirdPartyRecord(name, purpose, salaIdentifier, {
        block: block,
        room: room,
        roomNumber: roomNumber
    }, timeString);

    // Adicionar ao array do turno atual na data selecionada
    addRecordToCurrentShift([newRecord]);
    
    // Limpar formulário e fechar modal
    clearFormAndClose();
    
    // Mostrar notificação de sucesso
    showNotification(`Chave registrada com sucesso para ${name}!`, 'success');
}

function saveMultipleThirdPartyKeys(name, purpose) {
    if(selectedKeys.length === 0) {
        showNotification('Selecione pelo menos uma chave.', 'warning');
        return;
    }

    const timeString = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', 
                                                                minute: '2-digit' 
    });

    // Criar registros para cada chave selecionada
    const newRecords = selectedKeys.map(keyData => {
        return createThirdPartyRecord(name, purpose, keyData.identifier, keyData.roomDetails, timeString);
    });

    // Adicionar todos os registros ao turno atual
    addRecordToCurrentShift(newRecords);
    
    // Limpar formulário e fechar modal
    clearFormAndClose();
    
    // Mostrar notificação de sucesso
    showNotification(`${selectedKeys.length} chave(s) registrada(s) com sucesso para ${name}!`, 'success');
}

function createThirdPartyRecord(name, purpose, salaIdentifier, roomDetails, timeString) {
    return {
        id: `terceiro_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sala: salaIdentifier,
        professor: name + " (Terceiro)",
        disciplina: purpose,
        curso: "Terceiros",
        turma: "-",
        horaRetirada: timeString,
        horaDevolucao: null,
        notas: '-',
        
        roomDetails: roomDetails,
        
        // Campos de compatibilidade com o painel administrativo
        room: salaIdentifier,
        professorName: name + " (Terceiro)",
        subject: purpose,
        course: "Terceiros",
        turmaNumber: "-",
        withdrawalTime: timeString,
        returnTime: null,
        status: 'em_uso'
    };
}

function addRecordToCurrentShift(records) {
    // Adicionar ao array do turno atual na data selecionada
    const dateData = getDataForDate(selectedDate);
    
    if(!dateData[activeShift]) {
        dateData[activeShift] = [];
    }

    records.forEach(record => {
        dateData[activeShift].push(record);
    });
    
    // Atualizar localStorage e notificar TODOS os painéis (professor + admin)
    localStorage.setItem('allDateShiftData', JSON.stringify(dataByDateAndShift));
    localStorage.setItem('dataUpdateTimestamp', Date.now().toString());
    
    // Salvar no Firebase para persistência e sincronização em tempo real
    if(typeof saveDataToFirebase === 'function') {
        console.log('🔥 [TERCEIROS]: Salvando dados de terceiro no Firebase...');

        saveDataToFirebase(selectedDate, activeShift, dateData[activeShift]).then(() => {
            console.log('✅ [TERCEIROS]: Dados de terceiro salvos no Firebase com sucesso!');
        }).catch(error => {
            console.error('❌ [TERCEIROS]: Erro ao salvar dados de terceiro no Firebase:', error);
        });
    } else {
        console.warn('⚠️ [TERCEIROS]: Função saveDataToFirebase não disponível');
    }
    
    window.dispatchEvent(new CustomEvent('shiftDataUpdated', { 
        detail: { 
            shift: activeShift, 
            data:  dataByDateAndShift 
        } 
    }));
}

function clearFormAndClose() {
    // Limpar formulário
    document.getElementById('tpFullName').value = '';
    document.getElementById('tpPurpose').value = '';
    
    // Resetar seleções
    selectedKeys = [];
    multipleSelectionMode = false;
    currentKeyMode = null;
    
    // Limpar seleções atuais
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Voltar para a pergunta inicial
    document.getElementById('key-quantity-section').classList.remove('hidden');
    document.getElementById('key-quantity-section').classList.add('visible');
    
    // Esconder todas as outras seções
    document.getElementById('block-dropdown').classList.remove('visible');
    document.getElementById('block-dropdown').classList.add('hidden');
    document.getElementById('room-dropdown').classList.remove('visible');
    document.getElementById('room-dropdown').classList.add('hidden');
    document.getElementById('room-number-dropdown').classList.remove('visible');
    document.getElementById('room-number-dropdown').classList.add('invisible');
    document.getElementById('multiple-selection-section').classList.remove('visible');
    document.getElementById('multiple-selection-section').classList.add('invisible');
    
    // Resetar estilos inline que podem ter sido aplicados
    document.getElementById('room-dropdown').style.display = '';
    document.getElementById('room-number-dropdown').style.display = '';
    
    // Limpar indicador visual
    const indicator = document.getElementById('mode-indicator');
    if (indicator) {
        indicator.innerHTML = '<i class="bi bi-key"></i> Modo Ativo';
        indicator.className = 'badge bg-primary';
    }
    
    // Resetar dropdowns
    resetAllDropdowns();
    
    // Atualizar contador
    updateSelectedKeysCount();
    
    closeThirdPartyForm();
    renderTableForShift(activeShift);
}

// Inicia o sistema de Dropdowns
function initializeDropdowns() {
    // Configura os event listeners para todos os dropdowns
    setupDropdownToggle(document.getElementById('block-dropdown'));
    setupDropdownToggle(document.getElementById('room-dropdown'));
    setupDropdownToggle(document.getElementById('room-number-dropdown'));
    
    // Preenche o primeiro dropdown (Bloco)
    populateBlockDropdown();
    
    // Reseta os dropdowns dependentes
    resetDropdown('room-dropdown', 'Selecione a sala', true);
    resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);
}

// Função para alternar os dropdowns
function setupDropdownToggle(dropdownElement) {
    if(!dropdownElement) return;
    
    const selected = dropdownElement.querySelector('.selected');
    const options = dropdownElement.querySelector('.options');
    
    if(!selected || !options) return;
    
    selected.addEventListener('click', function(e) {
        e.stopPropagation();
        
        if(dropdownElement.classList.contains('disabled')) {
            return;
        }

        const isCurrentlyActive = selected.classList.contains('active');

        document.querySelectorAll('.drop-down-item').forEach(item => {
            item.classList.remove('dropdown-active');
        });
        
        // Fecha os outros dropdowns
        document.querySelectorAll('.drop-down-item .options').forEach(op => {
            if(op !== options) {
                op.classList.remove('show');
                op.parentElement.querySelector('.selected').classList.remove('active');
            }
        });

        // Caso o dropdown não esteja ativo, ele é ativado e recebe prioridade (z-index)
        if(!isCurrentlyActive) {
            options.classList.add('show');
            selected.classList.add('active');
            // Atribui também essa prioridade ao dropdown pai
            dropdownElement.closest('.drop-down-item').classList.add('dropdown-active');
        } else {
            // Se já estiver ativo, fecha
            options.classList.remove('show');
            selected.classList.remove('active');
        }
    });
}

// Ao usuário clicar fora o dropdown é fechado
document.addEventListener('click', function() {

    document.querySelectorAll('.options').forEach(options => {
        const selected = options.parentElement.querySelector('.selected');
        const dropdownItem = options.closest('.drop-down-item');

        options.classList.remove('show');

        if(selected) {
            selected.classList.remove('active');
        }
        if(dropdownItem) {
            dropdownItem.classList.remove('dropdown-active');
        }
    });
});

// Função para resetar os dropdowns
function resetDropdown(dropdownId, placeholderText, disable = true) {
    const dropdown = document.getElementById(dropdownId);

    // Interrompe a execução da função, caso o dropdown não for encontrado
    if(!dropdown) return;
    
    // Variáveis para armazenar o texto selecionado e a lista de opções
    let selectedText, options;
    
    if(dropdownId === 'block-dropdown') {
        selectedText = document.getElementById('valueBlock');
        options = dropdown.querySelector('.options');
    } else if(dropdownId === 'room-dropdown') {
        selectedText = document.getElementById('valueRoom');
        options = document.getElementById('room-dropdown-op');
    } else if(dropdownId === 'room-number-dropdown') {
        selectedText = document.getElementById('valueRoomNumber');
        options = document.getElementById('room-number-op');
    }
    
    if(selectedText) selectedText.textContent = placeholderText;
    if(options) options.innerHTML = '';    
    
    if(disable) {
        dropdown.classList.add('disabled');
        dropdown.classList.remove('visible');
        dropdown.classList.add('hidden');
    } else {
        dropdown.classList.remove('disabled');
        dropdown.classList.remove('hidden');
        dropdown.classList.add('visible');
    }
}

// Função que preenche os dropdowns de "Bloco" (primeiro dropdown)
function populateBlockDropdown() {
    const blockOptions = document.querySelector('#block-dropdown .options');
    
    if(!blockOptions) return;

    const blocks = Object.keys(dropdown);

    blockOptions.innerHTML = blocks.map(block => `
        <li class="option" data-value="${block}">${block}</li>
    `).join('');

    // Limpa todos as classes === "dropdown-active"
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
    });

    document.getElementById('block-dropdown').classList.add('dropdown-active');
    document.getElementById('room-dropdown').classList.remove('dropdown-active');
    document.getElementById('room-number-dropdown').classList.remove('dropdown-active');

    blockOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedBlock = this.getAttribute('data-value');

            if(selectedBlock !== currentSelections.block) {
                resetAllDropdowns();
            }
            
            // Atualiza as seleções
            currentSelections.block = selectedBlock;
            currentSelections.room = null;
            currentSelections.roomNumber = null;
            
            // Atualiza os ID's
            document.getElementById('valueBlock').textContent = selectedBlock;
            document.querySelector('#block-dropdown .selected').classList.remove('active');
            document.querySelector('#block-dropdown .options').classList.remove('show');
            document.querySelector('#block-dropdown .selected').classList.add('gradient');
            document.getElementById('block-dropdown').classList.add('selectedOption');
            
            // Remove a classe "dropdown-active" de block-dropdown
            document.getElementById('block-dropdown').closest('.drop-down-item').classList.remove('dropdown-active');

            document.getElementById('room-number-dropdown').classList.remove('invisible');
            document.getElementById('room-number-dropdown').classList.add('hidden');
            
            if (currentKeyMode === 'multiple') {
                // Modo múltiplo: mostrar imediatamente todas as chaves do bloco
                showMultipleSelectionSection();
                document.getElementById('room-dropdown').style.display = 'none';
                document.getElementById('room-number-dropdown').style.display = 'none';
                // Não chamar populateRoomDropdown no modo múltiplo
                return;
            } else {
                // Modo single: continuar com o fluxo normal
                // Garantir que room e room-number dropdowns estejam visíveis
                document.getElementById('room-dropdown').style.display = '';
                document.getElementById('room-number-dropdown').style.display = '';
                
                // Exibe o dropdown de Salas
                const roomDropdown = document.querySelector('#room-dropdown');
                if(roomDropdown) {
                    roomDropdown.classList.remove('hidden');
                    roomDropdown.classList.add('visible');
                }
                
                // Preenche o próximo dropdown e reinicia os seguintes
                populateRoomDropdown(selectedBlock);
            }
            resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);
        });
    });
}

// Função que preenche os dropdowns de "Sala" (segundo dropdown)
function populateRoomDropdown(selectedBlock) {
    const roomDropdown = document.getElementById('room-dropdown');
    const roomOptions = document.getElementById('room-dropdown-op');
    
    if(!roomOptions || !roomDropdown) return;

    const rooms = dropdown[selectedBlock] || [];

    roomOptions.innerHTML = rooms.map(roomObj => `
        <li class="option" data-value="${roomObj.sala}">${roomObj.sala}</li>
    `).join('');

    // Ativa o dropdown
    roomDropdown.classList.remove('disabled');

    // Limpa todas as classes === "dropdown-active" 
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
    });

    roomOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedRoom = this.getAttribute('data-value');

            if(selectedRoom !== currentSelections.room) {
                document.getElementById('room-number-dropdown').classList.add('active');
                document.getElementById('room-number-dropdown').classList.remove('noOptions');
                document.getElementById('selected-room-number').classList.remove('gradient');
            }
            
            // Atualiza as seleções
            currentSelections.room = selectedRoom;
            currentSelections.roomNumber = null;
            
            // Atualizar os ID's
            document.getElementById('valueRoom').textContent = selectedRoom;
            document.querySelector('#room-dropdown .selected').classList.remove('active');
            document.querySelector('#room-dropdown .selected').classList.add('gradient');
            roomOptions.classList.remove('show');
            document.getElementById('room-dropdown').classList.add('selectedOption');

            // Remove "dropdown-active" de "room-dropdown"
            document.getElementById('room-dropdown').closest('.drop-down-item').classList.remove('dropdown-active');
            
            // Exibe o dropdown de números de sala
            const roomNumberDropdown = document.querySelector('#room-number-dropdown');

            const roomObj = dropdown[selectedBlock].find(room => room.sala === selectedRoom);
            const numbers = roomObj ? roomObj.numeros : [];

            if(numbers.length != 0) {
                roomNumberDropdown.classList.remove('hidden');
                roomNumberDropdown.classList.remove('selectedOption');
                roomNumberDropdown.classList.remove('gradient');
                roomNumberDropdown.classList.add('visible');
                // Preenche o próximo dropdown e reinicia os seguintes
                populateRoomNumberDropdown(selectedBlock, selectedRoom);
            } else {
                // Se não há números de sala, considerar completo para modo single
                if (currentKeyMode === 'single') {
                    // Sala sem numeração - não precisamos mostrar seleção múltipla
                    roomNumberDropdown.classList.remove('visible');
                    roomNumberDropdown.classList.add('hidden');
                } else {
                    // Modo múltiplo: mostrar a seção de seleção múltipla
                    showMultipleSelectionSection();
                }
            }
        });
    });
}

// Função que preenche os dropdowns de "Número da Sala" (terceiro dropdown)
function populateRoomNumberDropdown(selectedBlock, selectedRoom) {
    const roomNumberDropdown = document.getElementById('room-number-dropdown');
    const roomNumberOptions = document.getElementById('room-number-op');
    
    if(!roomNumberOptions || !roomNumberDropdown) return;

    // Encontra o objeto <sala> para recuperar o vetor de <numeros>
    const roomObj = dropdown[selectedBlock].find(room => room.sala === selectedRoom);
    const numbers = roomObj ? roomObj.numeros : [];

    if(numbers.length === 0) {
        // Se não houver números disponíveis, desativa o dropdown e marca como "N/A"
        resetDropdown('room-number-dropdown', 'Sem numeração', true);
        currentSelections.roomNumber = null;
        roomNumberDropdown.classList.add('noOptions');
        roomNumberDropdown.classList.remove('hidden');

        setTimeout(() => {
            roomNumberDropdown.classList.add('selectedOption');
        }, 910);
        return;
    }

    // Preenche com os números disponíveis
    roomNumberOptions.innerHTML = numbers.map(number => `
        <li class="option" data-value="${number}">${number}</li>
    `).join('');

    // Ativa o dropdown
    roomNumberDropdown.classList.remove('disabled');
    document.getElementById('valueRoomNumber').textContent = 'Selecione o número da sala';

    // Clear all dropdown-active classes
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
    });

    roomNumberOptions.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            const selectedRoomNumber = this.getAttribute('data-value');
            
            // Atualiza as seleções
            currentSelections.roomNumber = selectedRoomNumber;
            
            // Atualiza os ID's
            document.getElementById('valueRoomNumber').textContent = selectedRoomNumber;
            document.querySelector('#room-number-dropdown .selected').classList.remove('active');
            document.querySelector('#room-number-dropdown .selected').classList.add('gradient');
            document.getElementById('room-number-dropdown').classList.add('selectedOption');
            roomNumberOptions.classList.remove('show');

            // Remove dropdown-active from room number dropdown
            document.getElementById('room-number-dropdown').closest('.drop-down-item').classList.remove('dropdown-active');
            
            // No modo single, a seleção está completa - não mostrar seleção múltipla
            if (currentKeyMode === 'multiple') {
                // Mostrar seção de seleção múltipla apenas no modo múltiplo
                showMultipleSelectionSection();
            }
        });
    });
}

// Reseta todos os dropdowns para o estado inicial
function resetAllDropdowns() { 
    // Reseta os selecionados
    currentSelections = {
        block: null,
        room: null,
        roomNumber: null
    };
    
    // Reseta os "placeholders" do dropdown e os estados
    resetDropdown('block-dropdown', 'Selecione o bloco', false);
    resetDropdown('room-dropdown',  'Selecione a sala',  true);
    resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);

    // Reseta o gradiente do dropdown selecionado
    const blockSelected = document.querySelector('#block-dropdown .selected');
    const roomSelected = document.querySelector('#room-dropdown .selected');
    const roomNumberSelected = document.querySelector('#room-number-dropdown .selected');
    
    if(blockSelected) blockSelected.classList.remove('gradient');
    if(roomSelected) roomSelected.classList.remove('gradient');
    if(roomNumberSelected) roomNumberSelected.classList.remove('gradient');

    // Remove all dropdown-active classes
    document.querySelectorAll('.drop-down-item').forEach(item => {
        item.classList.remove('dropdown-active');
        item.classList.remove('selectedOption');
    });

    const roomNumberDropdown = document.getElementById('room-number-dropdown');
    roomNumberDropdown.classList.remove('hidden');
    roomNumberDropdown.classList.remove('noOptions');
    roomNumberDropdown.classList.add('invisible');

    // Limpar conteúdo das opções
    const blockOptions = document.querySelector('#block-dropdown .options');
    const roomOptions = document.querySelector('#room-dropdown .options');
    const roomNumberOptions = document.querySelector('#room-number-dropdown .options');
    
    if(blockOptions) blockOptions.innerHTML = '';
    if(roomOptions) roomOptions.innerHTML = '';
    if(roomNumberOptions) roomNumberOptions.innerHTML = '';

    // Preenche novamente o primeiro dropdown
    populateBlockDropdown();
}


// ----------- Inicialização e mudança de turno -----------
function initialize() {
    console.log('Inicializando painel do professor...');
    const h = new Date().getHours();

    activeShift = (h < 12) ? 'manhã' : ((h < 18) ? 'tarde' : 'noite');
    console.log('Turno inicial:', activeShift);

    // Carregar mapeamento de professores do localStorage
    loadDocentesCodprofFromStorage();

    // Carregar dados e configurar interface
    loadSharedData();
    renderTabs();
    
    // Configurar os eventos
    document.getElementById('sortToggle')?.addEventListener('click', () => {
        sortAlphabetically = !sortAlphabetically;
        const btn = document.getElementById('sortToggle');
        
        if(btn) {
            btn.setAttribute('aria-pressed', String(sortAlphabetically));
            renderTableForShift(activeShift);
        }
    });

    // Iniciar verificação automática de turno
    setInterval(autoShiftTick, 60000);
    
    // Inicializar sincronização Firebase se estiver disponível
    if(typeof initializeFirebaseSync === 'function') {
        console.log('🔥 [PROFESSOR]: Inicializando sincronização Firebase...');
        initializeFirebaseSync();
    } else {
        console.warn('⚠️ [PROFESSOR]: Função initializeFirebaseSync não disponível');
    }
    
    // Inicializar ícones
    if(typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function switchShift(shift) { 
    console.log('Mudando para o turno:', shift);
    activeShift = shift; 
    renderTabs(); 
    renderTableForShift(activeShift); // Renderizar dados do novo turno
}

function autoShiftTick() {
    const d = new Date();
    
    if(d.getHours() === 12 && d.getMinutes() === 0) {
        switchShift('tarde');
    }
}

// Evento disparado quando todo o conteúdo DOM já foi carregado
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeDropdowns();
    }, 100);
});

// Verificar se a página já foi carregada e inicializar
if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}