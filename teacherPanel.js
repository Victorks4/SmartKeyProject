let activeAction = null;
let activeShift = 'manhã';
let sortAlphabetically = false;
// let selectedDate = new Date().toISOString().split('T')[0]; // Data atual no formato YYYY-MM-DD 
let selectedDate = "2025-08-31";
let dataByDateAndShift = {}; // Estrutura: { "2024-01-15": { manhã: [], tarde: [], noite: [] } }

// Variáveis para seleção múltipla de chaves
let selectedKeys = [];
let multipleSelectionMode = false;
let currentKeyMode = null; // 'single' ou 'multiple'

// FATS GERAL
const SHARED_TEACHER_FATS = "FATS1578";

// Mapa de docentes para CODPROF (DOCENTE -> CODPROF)
let docentesCodprof = {
    "Adalberto da Silva Correia": "TEACHER",
    "Adeildo Apolonio da Silva Junior": "TEACHER",
    "Aderlan dos Santos": "TEACHER",
    "Adilson Alexandre Amorim": "TEACHER",
    "Adjalbas de Oliveira Santos": "TEACHER",
    "Adriana Bitencourt Bezerra": "TEACHER",
    "Adriana Freitas de Moura": "TEACHER",
    "Adriane do Nascimento Apostolo": "TEACHER",
    "Adrianne Bastos Ferreira": "TEACHER",
    "Adriano Santos de Araujo": "TEACHER",
    "Adriel Rasslan da Silva Gama": "TEACHER",
    "Adson Aragão Carvalho": "TEACHER",
    "Agnelo Souto de Jesus Filho": "TEACHER",
    "Aislan da Silva Souza": "TEACHER",
    "Alberto César Queiroz Fonseca": "TEACHER",
    "Alberto Luís Santos e Santos": "TEACHER",
    "Alcígledes de Jesus Sales": "TEACHER",
    "Aldivan Fernandes Conceição Moura Junior": "TEACHER",
    "Alessandra Knoll": "TEACHER",
    "Alex Almeida de Souza": "TEACHER",
    "Alex Ferreira": "TEACHER",
    "Alexandre da Silva Nogueira": "TEACHER",
    "Alexandre Hartkopf Cardozo": "TEACHER",
    "Alexandre Jose Guerra Praia": "TEACHER",
    "Alexandre Morais Barbosa": "TEACHER",
    "Alexsandra Alves de Macedo Aquino": "TEACHER",
    "Alexsandra Zaparoli": "TEACHER",
    "Aline de Andrade Bonifácio": "TEACHER",
    "Aline de Cerqueira dos Santos": "TEACHER",
    "Alisson Cleisson Carvalho Silva": "TEACHER",
    "Allan Jackson Alves da Silva": "TEACHER",
    "Alvaro Tadeu Paes Fiuza Filho": "TEACHER",
    "Amanda de Almeida Santana": "TEACHER",
    "Amanda Moreira Santiago Pereira": "TEACHER",
    "ANA CARMEM CASTRO LEITE": "TEACHER",
    "Ana Carolina Rabêlo Nonato": "TEACHER",
    "Ana Caroline Neves da Silva": "TEACHER",
    "Ana Cláudia de Almeida Gomes Galiza": "TEACHER",
    "Ana Karine Ferreira Bastos Vidal": "TEACHER",
    "Ana Marcia dos Santos Silva": "TEACHER",
    "Ana Paula Farias Goulart": "TEACHER",
    "Ana Paula Pereira Lima": "TEACHER",
    "Anderson Batista Córdova": "TEACHER",
    "Anderson Bismark Porto e Silva": "TEACHER",
    "Anderson Emanuel Oliveira Daltro": "TEACHER",
    "Anderson Leandro da Silva Pita": "TEACHER",
    "Anderson Marcos Santos Lobo": "TEACHER",
    "André Luis Pinho Braga": "TEACHER",
    "André Luís Rocha Reis": "TEACHER",
    "André Luiz Gomes da Silva": "TEACHER",
    "André Luiz Santos Santana": "TEACHER",
    "Andre Pires Araujo Kuhn": "TEACHER",
    "Andressa Mirella Figueiras da Silva": "TEACHER",
    "Anésio Sousa Dos Santos Neto": "TEACHER",
    "Angel Cristian Barbosa Santos": "TEACHER",
    "Angelica da Silveira Lima": "TEACHER",
    "Anna Carolina Araujo Romualdo": "TEACHER",
    "Anna Paula Paz de Jesus": "TEACHER",
    "Anselmo Luiz Lima Brito Junior": "TEACHER",
    "Antônia Raniele Costa Lima": "TEACHER",
    "Antonio Henrique Ramos Bismarck César": "TEACHER",
    "Antonio Luis Gomes dos Santos": "TEACHER",
    "Antonio Marcos Pereira dos Santos": "TEACHER",
    "Antonio Nery da Silva Filho": "TEACHER",
    "Antônio Pinto de Santana Neto": "TEACHER",
    "Ari Santos Gomes": "TEACHER",
    "Ariádene Gomes Pinheiro": "TEACHER",
    "Arícia Silva Gama Muniz": "TEACHER",
    "Arlete do Nascimento Rocha": "TEACHER",
    "Arthur Gomes Lima França": "TEACHER",
    "Audrei de Abreu Marques": "TEACHER",
    "Augusto Magno Ornelas Saraiva": "TEACHER",
    "Áurea Pereira da Costa": "TEACHER",
    "Bárbara da Marilia Madureira Conceição": "TEACHER",
    "Bárbara Daiana da Anunciação Nascimento": "TEACHER",
    "BRUNO CHAVES SILVA": "TEACHER",
    "Bruno de Almeida Borges": "TEACHER",
    "Bruno de Menezes Moreira": "TEACHER",
    "Bruno dos Santos Pereira": "TEACHER",
    "Bruno dos Santos Pereira": "TEACHER",
    "Bruno Ferreira de Oliveira": "TEACHER",
    "Bruno Geovani Santos Silva": "TEACHER",
    "Bruno Oliveira da Silva": "TEACHER",
    "Bruno Paranhos Lima Bitencourt": "TEACHER",
    "Bruno Schramm Alves de Matos": "TEACHER",
    "Caio Hamab Costa": "TEACHER",
    "Caio Rhuan Ribeiro Oliveira": "TEACHER",
    "Caique Barbosa Santos": "TEACHER",
    "Caleb Sena da Silva": "TEACHER",
    "Camila Martins Ghilardi": "TEACHER",
    "Camila Pereira da Silva": "TEACHER",
    "Carini dos Santos de Souza": "TEACHER",
    "Carla Evelin Xavier Freitas": "TEACHER",
    "Carlos Alexandre Sant'ana Figueiredo": "TEACHER",
    "Carlos André de Jesus Santos": "TEACHER",
    "Carlos Augusto da Cruz Santos de Jesus": "TEACHER",
    "Carlos Augusto de Assis Alves Junior": "TEACHER",
    "Carlos Eduardo da Cruz Nascimento": "TEACHER",
    "Carlos Eduardo Ferreira Gomes": "TEACHER",
    "Carlos Robson Santos Cerqueira": "TEACHER",
    "Carmen Luft Bammesberger": "TEACHER",
    "Carolina Gesteira Lopes Lima": "TEACHER",
    "Carolina Souto Ferreira": "TEACHER",
    "Caroline Souza Cardoso da Silva Oliveira": "TEACHER",
    "Celia Nascimento Felix Filha": "TEACHER",
    "Celso de Oliveira": "TEACHER",
    "Chrislaynne Cardoso Cerqueira": "TEACHER",
    "Christiano Martinez Garcia": "TEACHER",
    "Cíntia Azevedo de Araújo": "TEACHER",
    "Cintia Gomes de Siqueira": "TEACHER",
    "CIRO TADEU DE MATOS BASTOS": "TEACHER",
    "Cislandia Maria dos Santos Oliveira": "TEACHER",
    "Clara Fernandes Bastos": "TEACHER",
    "Claryssa Palloma Rosa Barros de Oliveira": "TEACHER",
    "Claudemir Felix": "TEACHER",
    "Cláudia de Matos Santos": "TEACHER",
    "Claudia Mendes da Silva": "TEACHER",
    "Claudinei Aparecido Ferreira de Paula": "TEACHER",
    "Claudiomiro José Henn": "TEACHER",
    "Cléa Mercedes Alves de Jesus Oliva": "TEACHER",
    "Cleomenes Nunes Torres": "TEACHER",
    "Clóvis Andrade Filho": "TEACHER",
    "Crislane de Jesus Gomes": "TEACHER",
    "Crislayne Conceição da Silva de Oliveira": "TEACHER",
    "Cristiane de Souza Oliveira": "TEACHER",
    "Cristiane Pereira Santos de Souza": "TEACHER",
    "Cristiani de Moura": "TEACHER",
    "Cristiano Vieira Santos Passos": "TEACHER",
    "Daiana de Oliveira Machado Bulos": "TEACHER",
    "Daiane dos Santos Carvalho": "TEACHER",
    "Daniel Austregesilo Xavier de Oliveira": "TEACHER",
    "Daniel da Silva Araújo": "TEACHER",
    "Daniel dos Santos Lima": "TEACHER",
    "Daniel Duarte de Souza da Silva": "TEACHER",
    "DANIEL FERNANDES LIMA BISPO": "TEACHER",
    "Daniel Rabelo do Vale": "TEACHER",
    "Daniela Borges Cerqueira Tavares": "TEACHER",
    "Daniela Silva Chagas": "TEACHER",
    "Danieli da Silva Machado Souza": "TEACHER",
    "Danilo Brandão Soares": "TEACHER",
    "Danilo Ferreira Barros": "TEACHER",
    "Danilo Souza de Oliveira": "TEACHER",
    "Dannywill Medeiros dos Santos": "TEACHER",
    "Dante Bitencourt Nascimento Filho": "TEACHER",
    "Dante Nascimento Cunha": "TEACHER",
    "Dara Lima Medeiros": "TEACHER",
    "Darlene Neves Ramos Liger": "TEACHER",
    "Davi dos Santos Haack": "TEACHER",
    "David Roberto Vasel": "TEACHER",
    "Dayse Marana de Brito Araujo": "TEACHER",
    "Debora Maia Teixeira de Moura": "TEACHER",
    "Deivson Nonato Alves": "TEACHER",
    "Dejanira Silva Alves Pereira": "TEACHER",
    "Dejany dos Santos Silva": "TEACHER",
    "Denilson Brito dos Santos": "TEACHER",
    "Denivaldo de Queiroz Bispo": "TEACHER",
    "Dennis Jean Borges Rosado da Rocha": "TEACHER",
    "Diana Pereira dos Santos": "TEACHER",
    "Diego de Oliveira Teixeira": "TEACHER",
    "Diego Santos de Oliveira": "TEACHER",
    "Dilma Ribeiro Lopes": "TEACHER",
    "Dilson Portela Santos": "TEACHER",
    "Dinis Caetano Pereira Nascimento": "TEACHER",
    "Divino Alves Vieira": "TEACHER",
    "Docente Autoinstrucional": "TEACHER",
    "Duilio Almeida Norberto Da Silva": "TEACHER",
    "Dulcila Barreiros Torres": "TEACHER",
    "Ecatarine Ivi Guerrreiro de Freitas Figueiredo": "TEACHER",
    "Eddie William Calazans Ventura": "TEACHER",
    "Edilma Mendes de Sousa": "TEACHER",
    "Edilza Santana Bomfim": "TEACHER",
    "Edimilson Chaves dos Reis": "TEACHER",
    "Edinaldo do Nascimento Pereira Gomes": "TEACHER",
    "Edmayre Coelho dos Santos": "TEACHER",
    "Edmilson da Silva Rocha": "TEACHER",
    "Edson dos Santos": "TEACHER",
    "Edson José Nunes": "TEACHER",
    "Edson Luiz Pinto Cruz Junior": "TEACHER",
    "Edvaldo Cerqueira Santos": "TEACHER",
    "Elaine Graziela Sampaio Passos": "TEACHER",
    "Elaine Santos Silva": "TEACHER",
    "Elder Nunes da Silva": "TEACHER",
    "Eliana Pereira dos Santos": "TEACHER",
    "Eliandra dos Santos Mendes": "TEACHER",
    "Elias Dias Arruda de Paulo": "TEACHER",
    "ELIAS WASHINGTON CAMPOS OLIVEIRA": "TEACHER",
    "Eliecy Guirra Reis": "TEACHER",
    "Eliézer José da Silva": "TEACHER",
    "Eliseu Miranda Alves": "TEACHER",
    "Ellen Midian Santana da Silva": "TEACHER",
    "Ellerry Lima Silva": "TEACHER",
    "Emanoel Ferreira Costa da Rocha": "TEACHER",
    "Emerson Salgado de Carvalho": "TEACHER",
    "Emilly Nathalia Sousa Almeida": "TEACHER",
    "Eneida Crisitina Cardoso das Neves": "TEACHER",
    "Enio Cezar Dias Junior": "TEACHER",
    "Eric Cristiano Silva Soares": "TEACHER",
    "Éric Nunes Gomes": "TEACHER",
    "Érica Almeida Soares Araújo": "TEACHER",
    "Érica de Oliveira Silva": "TEACHER",
    "Érica Lavinia Borges Moraes de Oliveira": "TEACHER",
    "Erik do Carmo Marques": "TEACHER",
    "Erik do Carmo Marques": "TEACHER",
    "Erimonica Santos de Jesus Dantas": "TEACHER",
    "Euzebio Bastos da Silva": "TEACHER",
    "Evangildo Santana Santos": "TEACHER",
    "Evans Andrade Costa": "TEACHER",
    "Evson Santos Silva": "TEACHER",
    "Fabiana Araujo Diniz": "TEACHER",
    "Fábio da Silva Campos": "TEACHER",
    "Fábio Luciano Carvalho dos Santos": "TEACHER",
    "Fabio Lúcio Almeida Lima": "TEACHER",
    "Fabrício da Silva do Espírito Santo": "TEACHER",
    "Fabrício Pacheco Borges": "TEACHER",
    "Fagna Gomes da Silva Santos": "TEACHER",
    "Felipe de Lima Oliveira": "TEACHER",
    "Fernanda de Matos Fialho Tojo": "TEACHER",
    "Fernando Marafon Balem": "TEACHER",
    "Fernando Vessosi Alberti": "TEACHER",
    "Filipe Almeida da Conceição Inocencio": "TEACHER",
    "Filipe Santanna Freitas da Silva": "TEACHER",
    "Filipe Silva Santos": "TEACHER",
    "Flávio Ferreira Barbosa": "TEACHER",
    "Francegleide Souza Oliveira": "TEACHER",
    "Francieli Pacassa": "TEACHER",
    "Francielle Bitencourt de Oliveira": "TEACHER",
    "Francielli Pinto da Silva": "TEACHER",
    "Francisca Maria Mami Kaneoya": "TEACHER",
    "Francisco Marcos Rosa de Sousa": "TEACHER",
    "Francisco Vieira Lima": "TEACHER",
    "Francklin Moura da Costa": "TEACHER",
    "Frederico Dominguez Fonseca": "TEACHER",
    "Frederico Iglezias Figueira": "TEACHER",
    "Gabriel Cabral Daltro": "TEACHER",
    "Gabriel Queiroz dos Santos": "TEACHER",
    "Gabriel Rocha Santos": "TEACHER",
    "Gabriel Souza de Santana": "TEACHER",
    "Gabriel Vitorio de Arcanjo": "TEACHER",
    "Gabriel Wendel Santos da Silva": "TEACHER",
    "Gabrielle Albuquerque Maciel Brasileiro": "TEACHER",
    "Geandson Almeida de Sousa": "TEACHER",
    "Geisa Ferraz Lima Córdova": "TEACHER",
    "Genilson Santana Santos": "TEACHER",
    "Genival de Andrade Silva": "TEACHER",
    "Genivania Gomes Oliveira": "TEACHER",
    "George Anderson Soares e Sales": "TEACHER",
    "George Bispo dos Santos": "TEACHER",
    "Gerusa Souza Pimentel": "TEACHER",
    "Giancarlo Alves Simões": "TEACHER",
    "Gilberto Lopes Nery": "TEACHER",
    "Gildean Santos Ribeiro": "TEACHER",
    "Gilmar Menezes": "TEACHER",
    "Gilmar Pereira Mota": "TEACHER",
    "Gilmario dos Santos Machado": "TEACHER",
    "Gilsimar de Jesus Benicio": "TEACHER",
    "Gilson Marcelo da Silva Rios": "TEACHER",
    "Girlene Bispo de Oliveira": "TEACHER",
    "Gislana Santana Machado": "TEACHER",
    "Gizelle Karine Santos Alcantara": "TEACHER",
    "Gleice da Silva Diogo": "TEACHER",
    "Gleison Fernandes da Silva": "TEACHER",
    "Guilherme Canarin Marcellino": "TEACHER",
    "Hanna Mayara Miranda Araujo": "TEACHER",
    "Hebert Santos Peneluc": "TEACHER",
    "Henderson Cari Nascimento": "TEACHER",
    "Henderson Souza Chalegre": "TEACHER",
    "Henrique Silveira Alves Marques": "TEACHER",
    "HERBERT CÂNDIDO DOS SANTOS": "TEACHER",
    "Heron Borges Machado": "TEACHER",
    "Hiago Santos Silva": "TEACHER",
    "Hikaro dos Santos Carvalho": "TEACHER",
    "Hilton Brandão": "TEACHER",
    "Hipólito Matos Carneiro": "TEACHER",
    "Hudson de Carvalho Lima": "TEACHER",
    "Iago de Cerqueira Azevedo": "TEACHER",
    "Ian Hudson Martins de Oliveira": "TEACHER",
    "Ian Pedro Martinez Silva": "TEACHER",
    "Iara de Andrade Oliveira": "TEACHER",
    "Ícaro Vasconcelos Alvim": "TEACHER",
    "Igor Ernandez Almeida Santana": "TEACHER",
    "Igor Silva Marques": "TEACHER",
    "Igor Souza de Almeida": "TEACHER",
    "Iguaraci de Souza Tavares": "TEACHER",
    "ILKA MARA ALVES DA SILVA": "TEACHER",
    "Ingrid Barreto de Almeida Passos": "TEACHER",
    "Ingrid Rocha Teixeira": "TEACHER",
    "Iraneide dos Anjos dos Santos": "TEACHER",
    "Iranilton Pereira Santos": "TEACHER",
    "Iris Araújo Silva": "TEACHER",
    "Irlan Silva de Almeida": "TEACHER",
    "Iromar de Freitas Nascimento Filho": "TEACHER",
    "Isaac Porto Assunção": "TEACHER",
    "Islane Ferreira de Andrade": "TEACHER",
    "Ismael de Andrade Gonçalves": "TEACHER",
    "Ivan Gomes Soares": "TEACHER",
    "Ivanildo Gomes da Silva": "TEACHER",
    "Ivo Ribeiro Almeida": "TEACHER",
    "Jaciane Saba Bispo": "TEACHER",
    "Jaciara Teodora dos Reis Malta": "TEACHER",
    "Jadiane de Almeida Ribeiro de Santana": "TEACHER",
    "Jadieli Sansão Elias Lima": "TEACHER",
    "Jadilma Rodrigues da Silva Dias": "TEACHER",
    "Jailson dos Santos Júnior": "TEACHER",
    "Jair Santos de Almeida": "TEACHER",
    "Jairo Alves da Silva": "TEACHER",
    "Jamile Batista dos Santos": "TEACHER",
    "Janaína Gonçalves Bastos": "TEACHER",
    "Janielson Barbosa de Oliveira": "TEACHER",
    "Jaqueline de Souza Pereira": "TEACHER",
    "Jaqueline Santos da Silva": "TEACHER",
    "Jean dos Santos Carvalho Goes": "TEACHER",
    "Jean Moreira Lins": "TEACHER",
    "Jeane Cerqueira Ferreira": "TEACHER",
    "Jeane Lima dos Santos": "TEACHER",
    "Jeanildo de Aragão Alves": "TEACHER",
    "Jeferson Navarro": "TEACHER",
    "Jefferson Leite de Jesus": "TEACHER",
    "Jefté Goes Salvador Silva": "TEACHER",
    "Jeilson Soares Cerqueira": "TEACHER",
    "Jeovan Moreira dos Reis": "TEACHER",
    "Jessica Alves Dutra": "TEACHER",
    "Jéssica Franco Freitas Macena": "TEACHER",
    "Jéssica Queli Santos Santana Nunes": "TEACHER",
    "Jessiele Caroline Santos Santana Nunes": "TEACHER",
    "Jhonatan Filippe Alves Macedo": "TEACHER",
    "Jhonne Elson Queiroz Moreira": "TEACHER",
    "Joab Lima Alves": "TEACHER",
    "Joacy Marley Queiroz Mota": "TEACHER",
    "Joane de Jesus Araújo": "TEACHER",
    "João Batista Moura Santos": "TEACHER",
    "João Fernando Souza Flores Filho": "TEACHER",
    "João Gabriel Ferreira Vitório": "TEACHER",
    "João Gabriel Santos de Souza": "TEACHER",
    "João Garcia da Mota": "TEACHER",
    "João Guilherme Lisboa Moreira": "TEACHER",
    "João Marcos Araujo Pereira": "TEACHER",
    "João Marcos Xavier Matos": "TEACHER",
    "João Paulo Dias da Silva Munck": "TEACHER",
    "João Valter Batista Santos Filho": "TEACHER",
    "João Vitor Ferreira Matos": "TEACHER",
    "João Vitor Merlo": "TEACHER",
    "João Vitor Santos Silva": "TEACHER",
    "Joce Macedo Ramos": "TEACHER",
    "Jociel Alves de Jesus": "TEACHER",
    "Joeli Rodrigues da Hora": "TEACHER",
    "Joéliton Santos Neri": "TEACHER",
    "Joice Oliveira de Jesus Bastos": "TEACHER",
    "Joilson Garcia da Mota": "TEACHER",
    "Jonatah Nery de Carvalho": "TEACHER",
    "Jonatas Mendes dos Santos": "TEACHER",
    "Jones Emanuel dos Santos Junior": "TEACHER",
    "Jorgeana Shirley dos Santos": "TEACHER",
    "Jorgevany Almeida Santos": "TEACHER",
    "José Ademar da Silva de Souza Junior": "TEACHER",
    "Jose Antonio de Oliveira Fonseca": "TEACHER",
    "José Batista de Macedo Júnior": "TEACHER",
    "José Benedito de Lima": "TEACHER",
    "José da Costa Lima Neto": "TEACHER",
    "JOSE DOMINGOS NUNES DOS SANTOS": "TEACHER",
    "José Eliseu Araújo Damião": "TEACHER",
    "José Fabricio Oliveira de Santana": "TEACHER",
    "José Luis da Silva Rocha": "TEACHER",
    "José Marciel Reis Mascarenhas": "TEACHER",
    "Jose Mario de Jesus Pinheiro": "TEACHER",
    "José Milton Vitorino dos Reis": "TEACHER",
    "José Vagner de Souza Batista": "TEACHER",
    "José Vital de Souza Filho": "TEACHER",
    "Josefa Fagner dos Santos": "TEACHER",
    "Joselia Lima de Sena Alves": "TEACHER",
    "Josenildo Macêdo Oliveira": "TEACHER",
    "Josete Oliveira Carvalho": "TEACHER",
    "Josi dos Anjos Silva": "TEACHER",
    "Josilene da Silva de Jesus": "TEACHER",
    "Josimary Kelly Amado Santos": "TEACHER",
    "Josue dos Santos Souza": "TEACHER",
    "Josué Leite Conceição": "TEACHER",
    "Josué Oliveira de Araujo": "TEACHER",
    "Jozan dos Santos Barbosa": "TEACHER",
    "Juciara Pedreira de Jesus Freitas": "TEACHER",
    "Jucinaldo Cardoso dos Reis": "TEACHER",
    "Julia dos Anjos Costa": "TEACHER",
    "Júlia Oliveira Cordeiro": "TEACHER",
    "Juliana Santos da Silva": "TEACHER",
    "Juliana Silva Bastos": "TEACHER",
    "Juliana Vieira Santos Pereira": "TEACHER",
    "Juracy Oliveira Cardoso": "TEACHER",
    "Justino Neves de Jesus Neto": "TEACHER",
    "Karina Casola Fernandes": "TEACHER",
    "Karine das Neves Paixão Silva": "TEACHER",
    "Karoline Conceicao da Fonseca Santos": "TEACHER",
    "Karolyne Mota Gomes": "TEACHER",
    "Kelly Dourado Rodrigues": "TEACHER",
    "Kleber Bomfim de Oliveira": "TEACHER",
    "Laecio dos Santos Teixeira": "TEACHER",
    "Laís Leão Sampaio Leite": "TEACHER",
    "Lais Lorena Ribeiro": "TEACHER",
    "Layla de Oliveira Pires Aquino": "TEACHER",
    "Leandro dos Santos Viana": "TEACHER",
    "Leandro Neves Alves": "TEACHER",
    "Leandro Silva Costa": "TEACHER",
    "Leda dos Santos Souza": "TEACHER",
    "Leilane Ferreira Santos": "TEACHER",
    "Leiliane Vieira Souza": "TEACHER",
    "Leniel Oliveira dos Santos": "TEACHER",
    "Leonard Fernandes e Silva": "TEACHER",
    "Leonardo Andrade Souza": "TEACHER",
    "Leonardo Argolo dos Santos": "TEACHER",
    "Leonardo da Costa Lins": "TEACHER",
    "Leonardo Silva Pinto": "TEACHER",
    "Leonice Nascimento Santiago": "TEACHER",
    "Leticia Rodrigues Pereira de Santana": "TEACHER",
    "Létícia Rosa de Jesus": "TEACHER",
    "LÍBIA XIMENES CABRAL MARTINS": "TEACHER",
    "Lidiane de Jesus Freitas": "TEACHER",
    "Liliane Ribeiro dos Santos": "TEACHER",
    "Liliane Ribeiro dos Santos Fernandes": "TEACHER",
    "Lindinéia Gomes Bastos": "TEACHER",
    "Lindomar Carlos Sodré da Silva": "TEACHER",
    "Lindsei Oliveira Machado": "TEACHER",
    "Lívia Graziele Gomes Ramos da Silva": "TEACHER",
    "Livia Suely Silva Souza": "TEACHER",
    "Liziane da Silva Carneiro": "TEACHER",
    "Luan Guimarães da Silva": "TEACHER",
    "Luana Moura Silva": "TEACHER",
    "Luana Silva dos Santos": "TEACHER",
    "Lucas Cauã de Souza Mota": "TEACHER",
    "Lucas da Glória Oliva Costa": "TEACHER",
    "Lucas Moreira Reis": "TEACHER",
    "Lucas Porto Assunção": "TEACHER",
    "Lucas Santos Brandão": "TEACHER",
    "Lucas Silva Sampaio": "TEACHER",
    "Lucas Soares Santos": "TEACHER",
    "Luciana Cassia Goes Pereira": "TEACHER",
    "Luciana dos Santos Silva Marques": "TEACHER",
    "Luciana Maria Limeira dos Santos": "TEACHER",
    "Luciana Mendes Brito Vidal": "TEACHER",
    "Luciana Santos Nobre": "TEACHER",
    "Luciano Santos Ribeiro": "TEACHER",
    "Luciélia dos Santos Novaes": "TEACHER",
    "Lucineide Miranda Silva Araújo": "TEACHER",
    "Lucio Roberto Severo Rosas": "TEACHER",
    "Lucivânia Silva Carneiro de Cintra": "TEACHER",
    "Luidivan Rodrigues Alves": "TEACHER",
    "Luis Fabio Santos da Silva": "TEACHER",
    "Luis Tertuliano Silva de Souza": "TEACHER",
    "Luiz Carlos Campos Torres": "TEACHER",
    "Luiz Eduardo Araujo Machado": "TEACHER",
    "Luiz Eduardo Batista Barreto Junior": "TEACHER",
    "Luize Muricy dos Santos Vieira": "TEACHER",
    "Lumma da Silva Borges": "TEACHER",
    "Luziete Moreira Santos": "TEACHER",
    "Luzimary Carneiro de Lima": "TEACHER",
    "Magna Maria Lima": "TEACHER",
    "Magno Santana Morais": "TEACHER",
    "Maiara Argolo Negromonte": "TEACHER",
    "Maiara de Jesus Araújo": "TEACHER",
    "Maicon Luiz Muniz da Silva": "TEACHER",
    "Maida Santos Alcântara": "TEACHER",
    "MANOEL DAMASIO ALVES": "TEACHER",
    "Manoel Gustavo Souza de Almeida Pina": "TEACHER",
    "Manoel Hito Sampaio Mascarenhas": "TEACHER",
    "Manoel Serafim da Silva Neto": "TEACHER",
    "Manoela Trabuco de Queiroz": "TEACHER",
    "Marcello Oliveira Coelho Silva": "TEACHER",
    "Marcelo de Vasconcelos Pereira": "TEACHER",
    "Marcelo dos Santos Santana": "TEACHER",
    "Marcelo Luis Moreira Sousa": "TEACHER",
    "Marcelo Márcio de Oliveira Ferreira": "TEACHER",
    "Marcelo Santana Lacerda": "TEACHER",
    "Marcilio Aquino Marques": "TEACHER",
    "Márcio Lima Carneiro de Oliveira": "TEACHER",
    "Marco Antonio Maia Santos": "TEACHER",
    "Marcos Antônio Vieira Costa": "TEACHER",
    "Marcos Augusto de Jesus Souza": "TEACHER",
    "Marcos Cesar Nunes Laranjeiras Filho": "TEACHER",
    "Marcos Davi Barbosa de Oliveira": "TEACHER",
    "Marcos de Souza Simões": "TEACHER",
    "Marcos Paulo Araujo Santiago": "TEACHER",
    "Marcos Teixeira Quadro": "TEACHER",
    "Marcos Vinicius Cerqueira Santos": "TEACHER",
    "Marcos Vinicius de Oliveira Santos": "TEACHER",
    "Marcos Vinicius Petri": "TEACHER",
    "Maria das Graças Oliveira Lira": "TEACHER",
    "Maria Do Carmo Souza Santos": "TEACHER",
    "Maria Fernanda Menezes de Oliveira de Souza": "TEACHER",
    "Maria Gilcilene Maciel Rocha": "TEACHER",
    "Maria Izabel Cruz Alves Simões": "TEACHER",
    "Maria Janaina Daltro Alves": "TEACHER",
    "Maria Mariluce Vitalino Santos": "TEACHER",
    "Mariana do Rosário Liger": "TEACHER",
    "Mariana Moura Pinheiro": "TEACHER",
    "Mariana Torres Uchôa": "TEACHER",
    "Marileia Araujo da Silva": "TEACHER",
    "Marilene Santos de Jesus Lins": "TEACHER",
    "Marilia Neri Porto": "TEACHER",
    "Marina Ane Gomes Cordeiro": "TEACHER",
    "Marina Brayner dos Santos": "TEACHER",
    "Mario Andre Correia Ribeiro": "TEACHER",
    "Marisete Kniess Adriano": "TEACHER",
    "Mariza de Oliveira Conceição Bela": "TEACHER",
    "Marlangela Santos Cunha": "TEACHER",
    "Marlon Nunes Couto": "TEACHER",
    "Marta Farias Almeida da Silva": "TEACHER",
    "Mateus de Santana Souza": "TEACHER",
    "Matheus Araujo de Assis": "TEACHER",
    "Matheus Barreto Ribas": "TEACHER",
    "Matheus da Silva Teixeira": "TEACHER",
    "Matheus de Oliveira": "TEACHER",
    "Matheus Nunes Menezes": "TEACHER",
    "Mathias de Oliveira Carneiro": "TEACHER",
    "Mauricio de Almeida Silva": "TEACHER",
    "Maurino Candido de Medeiros": "TEACHER",
    "Maxuel Carlos de Melo": "TEACHER",
    "Mayk Fernandes Lima da Silva": "TEACHER",
    "Meirise Araújo dos Santos Silva": "TEACHER",
    "Mennandro Menezes de Oliveira": "TEACHER",
    "Merilin Gomes de Oliveira Moreira": "TEACHER",
    "Michelle Sousa de Freitas": "TEACHER",
    "MIGUEL DA SILVA BASTOS": "TEACHER",
    "MILENA CORDEIRO DA SILVA": "TEACHER",
    "Milena Fonsêca Rios Araújo": "TEACHER",
    "Milena Ribeiro dos Santos": "TEACHER",
    "Milenna Santos Silva": "TEACHER",
    "Millena Pereira Brito": "TEACHER",
    "Mirela Macedo Sandes": "TEACHER",
    "Mirian Maria Araújo": "TEACHER",
    "Moisés Lima Santos": "TEACHER",
    "Murilo Gomes Santana": "TEACHER",
    "Nadja Rita Santos Cezar": "TEACHER",
    "Naila Naja Silva Soares": "TEACHER",
    "Natália Campbell Correa": "TEACHER",
    "Natalia Cristina Amorim Nascimento": "TEACHER",
    "Natalicio Diego da Silva": "TEACHER",
    "Natanael do Nascimento Pereira Neto": "TEACHER",
    "Nathanael Pereira de Oliveira": "TEACHER",
    "Nayara Oliveira de Lima": "TEACHER",
    "Nayara Santos Queiroz": "TEACHER",
    "Neidson Santana de Souza": "TEACHER",
    "Nilo Dantas da Silva": "TEACHER",
    "Norman Bitencourt da Silva Montenegro": "TEACHER",
    "Nubia Oliveira da Silva": "TEACHER",
    "Nubia Viana Cardoso Leal": "TEACHER",
    "Olandiara de Aragão dos Santos": "TEACHER",
    "Osny Dantas de Oliveira Silva": "TEACHER",
    "Osvaldo da Silva Neto": "TEACHER",
    "Otávio Teixeira Pinto": "TEACHER",
    "Ozair Santos Lima": "TEACHER",
    "Pablo Cruz de Santana": "TEACHER",
    "Pâmela Villare Fernandes Fonseca": "TEACHER",
    "Patricia Claudia da Silva": "TEACHER",
    "Patrícia Cristiane Alcarria Martins": "TEACHER",
    "Patricia dos Santos": "TEACHER",
    "PATRICIA REIS CALASANS": "TEACHER",
    "Patrícia Silva das Merces": "TEACHER",
    "Paulo Ferreira da Costa Neto": "TEACHER",
    "Paulo Sergio da Silva Oliveira Junior": "TEACHER",
    "Paulo Victor Aragão dos Santos": "TEACHER",
    "Pedro Geraldo Correia da Silva": "TEACHER",
    "Pedro Henrique Almeida dos Santos Alves": "TEACHER",
    "Pedro Ivo Santos Furtado": "TEACHER",
    "Pedro Kleber Matos de Araujo": "TEACHER",
    "Pedro Lopes Batista Neto": "TEACHER",
    "Pedro Raimundo Soares da Conceição": "TEACHER",
    "Phillipe Ramos Brandão": "TEACHER",
    "Poliana Silva Araújo": "TEACHER",
    "Priscila Mikulski Guedes": "TEACHER",
    "Priscila Natividade de Jesus": "TEACHER",
    "Priscila Saturnino dos Santos Brandão": "TEACHER",
    "Priscila Souza Azevedo": "TEACHER",
    "Priscilla Araujo Vieira": "TEACHER",
    "Quécia Ferreira de Oliveira": "TEACHER",
    "Quelen Priscila Santana da Silva Santos": "TEACHER",
    "Quelme de Jesus Silva Brito": "TEACHER",
    "Rachell Adrielle Bomfim Reis Santos": "TEACHER",
    "Rafael Brito Teixeira": "TEACHER",
    "Rafael Nascimento Caldeira": "TEACHER",
    "Rafael Parenti": "TEACHER",
    "Rafaella Braga Santos": "TEACHER",
    "Rafaella Cerqueira Oliveira Souza": "TEACHER",
    "Raphaela Santana Melo Araujo": "TEACHER",
    "Raul Dauram de Vasconcelos": "TEACHER",
    "Rayanna Rodrigues Evangelho": "TEACHER",
    "Regis Marsico Cayret": "TEACHER",
    "Regivaldo Francisco da Silva Junior": "TEACHER",
    "Reinalda dos Santos Ramos": "TEACHER",
    "Reinaldo Silva de Sena": "TEACHER",
    "Renaldo dos Santos Ramos": "TEACHER",
    "Renan do Carmo Araujo": "TEACHER",
    "Renata da Purificação Pinto": "TEACHER",
    "Renato Buranelli": "TEACHER",
    "Renildo da Silva Santos": "TEACHER",
    "Rescima Fernanda Novais dos Santos": "TEACHER",
    "Rhavi Gonçalves de Borda": "TEACHER",
    "Rita Urânia Silva Santos": "TEACHER",
    "Roberta Silva Pereira": "TEACHER",
    "Roberto Carrion Eça da Silva": "TEACHER",
    "Robson Carvalho Freitas": "TEACHER",
    "Rodrigo Roberto Dias": "TEACHER",
    "Rogério Cerqueira Lima": "TEACHER",
    "Rogerio da Silva Fiscina": "TEACHER",
    "Romário Andrade Rodrigues": "TEACHER",
    "Romulo Carvalho de Souza Vieira": "TEACHER",
    "Romulo Lopes Souza": "TEACHER",
    "Ronaldo Soares Monteiro": "TEACHER",
    "Ronei Vagner Alves": "TEACHER",
    "Roquelane Ramos da Conceição": "TEACHER",
    "Rosenilson Lima Macêdo": "TEACHER",
    "Rosilene da Silva Dias": "TEACHER",
    "Rosimeire de Vasconcelos": "TEACHER",
    "RUBENS OLIVEIRA LIMA JUNIOR": "TEACHER",
    "Rudney Oliveira de Freitas": "TEACHER",
    "Sabrina Bet": "TEACHER",
    "Samer Magaldi Almerindo": "TEACHER",
    "Samuel da Silva Cunha": "TEACHER",
    "Saolo Santos Souza": "TEACHER",
    "Sergio Henrique Ferreira Martins": "TEACHER",
    "Shirlei Lima dos Anjos": "TEACHER",
    "Sidnei dos Santos Sacramento": "TEACHER",
    "Sidney Conceição Andrade": "TEACHER",
    "Sidney da Silva Jesus": "TEACHER",
    "Silas Pereira Santos": "TEACHER",
    "Silas Santos Carvalho": "TEACHER",
    "Sillas Leal Castro Silva": "TEACHER",
    "Silmara Simas dos Santos": "TEACHER",
    "Silvano Pinto Dias": "TEACHER",
    "Silvoney Santos Couto": "TEACHER",
    "Simone dos Santos do Amaral": "TEACHER",
    "Sirlex de Almeida Figueredo": "TEACHER",
    "Sócrates Sousa Queiroz": "TEACHER",
    "Solismar De Souza Aroeira": "TEACHER",
    "Stefanie Daysy Sipert Miranda": "TEACHER",
    "Sterfany da Silva Almeida": "TEACHER",
    "Sueli Oliveira Costa": "TEACHER",
    "Sueli Vieira Leão": "TEACHER",
    "SUNANDA MARIA RODRIGUES BATISTA": "TEACHER",
    "Suran Oliveira Messias": "TEACHER",
    "Suzanna Raquel Ramos Lima": "TEACHER",
    "Tainá Melo de Oliveira": "TEACHER",
    "Talita Emanuele Abreu da Silva": "TEACHER",
    "Tamara Eloy Caldas": "TEACHER",
    "Tânia Maria Cardoso Cerqueira": "TEACHER",
    "Tania Renilda Santos Torres": "TEACHER",
    "Tarcisio Marques Santos de Souza": "TEACHER",
    "Tassio de Freitas Ferreira": "TEACHER",
    "Tayane de Jesus Nunes": "TEACHER",
    "Tércio Borges Ribeiro": "TEACHER",
    "Thaiany Santana da Cruz Nunes": "TEACHER",
    "Thais Santana Barreto": "TEACHER",
    "Thiago Alves Carneiro": "TEACHER",
    "Thiago Jesus de Oliveira Trindade": "TEACHER",
    "Thiago Mendes Paixão Melo": "TEACHER",
    "Thiago Vinicius Barbosa Menezes Sales": "TEACHER",
    "Thomas Santos da Silva": "TEACHER",
    "Tiago Araujo Freaza dos Santos": "TEACHER",
    "Tiago Araujo Matos": "TEACHER",
    "Tiago da Silva Oliveira": "TEACHER",
    "Tiago Luis Santos Silva": "TEACHER",
    "Tiago Martins dos Santos de Jesus": "TEACHER",
    "TIAGO MEDRADO COSTA": "TEACHER",
    "Tony Clériston Oliveira dos Santos": "TEACHER",
    "Topson Andrade dos Santos": "TEACHER",
    "Ualison Pereira Roque Freitas": "TEACHER",
    "Uallas Henrique de Oliveira de Brito": "TEACHER",
    "Uerles Bastos de Menezes": "TEACHER",
    "Uilberton de Oliveira Soares": "TEACHER",
    "Vando Silva Bizerra": "TEACHER",
    "Vanessa de Oliveira Debiasi": "TEACHER",
    "Vanessa Silva Lima": "TEACHER",
    "Vanessa Vilanova Fraga Vieira": "TEACHER",
    "Vânia Lago Guimarães Correia": "TEACHER",
    "Velluma Cerqueira Invenção de Oliveira": "TEACHER",
    "Victor da Silva Pimenta": "TEACHER",
    "Victor Lima Cardoso": "TEACHER",
    "Victor Moak da Silva Souza": "TEACHER",
    "Victor Montes Fernandes Pereira": "TEACHER",
    "Victor Oliveira Mascarenhas": "TEACHER",
    "Vinicius Camelo Molinari": "TEACHER",
    "Vinicius Lima Cardoso": "TEACHER",
    "Vinícius Ornellas de Araújo": "TEACHER",
    "Viviane Rafael Ferreira": "TEACHER",
    "Wagner José Mezoni": "TEACHER",
    "Waldemir Pereira Santiago": "TEACHER",
    "Wanna Nascimento Macedo": "TEACHER",
    "Weiller Queiroz Silva": "TEACHER",
    "Welber Lima de Brito Guimarães": "TEACHER",
    "Welder Nascimento dos Santos": "TEACHER",
    "Welder Nascimento dos Santos": "TEACHER",
    "Welington Salomão Pereira": "TEACHER",
    "Wesley Moura da Silva Pereira": "TEACHER",
    "Wguaracy Araujo Santana": "TEACHER",
    "William Martins Lopes Ribeiro": "TEACHER",
    "Williane Santana Marques": "TEACHER",
    "Wilton Silva Souza": "TEACHER",
    "Yanes Costa Nascimento": "TEACHER",
    "Yanna Carvalho de Assis": "TEACHER",
    "Zilmaura Santos Daltro": "TEACHER"
};

// Função para validar se um professor existe no sistema
function isValidTeacher(teacherName) {
    if(!teacherName || typeof teacherName !== 'string') return false;
    
    const normalizedInput = teacherName.trim().toLowerCase();
    
    if(docentesCodprof[teacherName]) return true;
    
    // Faz a validação convertendo os valores para LowerCase
    for(const name of Object.keys(docentesCodprof)) {
        if(name.toLowerCase() === normalizedInput) return true;
    }
    
    return false;
}

// Função para obter o FATS compartilhado
function getSharedFatsForTeacher(teacherName) {
    if(!isValidTeacher(teacherName)) {
        console.warn(`Professor não encontrado no sistema: ${teacherName}`);
        return '';
    }
    
    return SHARED_TEACHER_FATS;
}

// Função para validar FATS
function validateTeacherFats(inputFats, teacherName) {
    if(!inputFats || typeof inputFats !== 'string') {
        return { valid: false, message: 'FATS ID é obrigatório' };
    }
    
    const normalizedInput = inputFats.trim().toUpperCase();
    
    if(!isValidTeacher(teacherName)) {
        return { 
            valid: false, 
            message: 'Professor não encontrado no sistema' 
        };
    }
    
    if(normalizedInput === SHARED_TEACHER_FATS) {
        return { valid: true, message: 'FATS validado com sucesso' };
    }
    
    return { 
        valid: false, 
        message: 'FATS ID incorreto. Use o FATS compartilhado pelos professores.' 
    };
}

// Salva o FATS compartilhado no localStorage
localStorage.setItem("sharedTeacherFats", SHARED_TEACHER_FATS);

// Salva os dados dos professores no localStorage
localStorage.setItem("docentesCodprof", JSON.stringify(docentesCodprof));

// Função adicionar novo professor
function addTeacherToSystem(teacherName) {
    if(!teacherName || typeof teacherName !== 'string') {
        console.warn('Nome do professor é obrigatório');
        return false;
    }
    
    const normalizedName = teacherName.trim();
    
    // Verifica se o professor já existe
    if(isValidTeacher(normalizedName)) {
        console.warn(`Professor ${normalizedName} já existe no sistema`);
        return false;
    }
    
    // Adiciona professor ao sistema
    docentesCodprof[normalizedName] = "TEACHER";
    
    // Salva no localStorage
    saveTeacherNamesToStorage();
    
    console.log(`Professor ${normalizedName} adicionado ao sistema`);
    return true;
}

// Salva os nomes de professores no localStorage
function saveTeacherNamesToStorage() {
    try {
        localStorage.setItem('docentesCodprof', JSON.stringify(docentesCodprof));
        console.log('Lista de professores salva no localStorage');
    } catch(error) {
        console.error('Erro ao salvar lista de professores: ', error);
    }
}

// Carrega os nomes de professores do localStorage
function loadTeacherNamesFromStorage() {
    try {
        const saved = localStorage.getItem('docentesCodprof');

        if(saved) {
            const savedNames = JSON.parse(saved);

            Object.assign(docentesCodprof, savedNames);
            console.log('Lista de professores carregada do localStorage');
        }
    } catch(error) {
        console.error('Erro ao carregar lista de professores: ', error);
    }
}

// Funções globais para uso externo
window.addNewTeacherToSystem = function(teacherName) {
    return addTeacherToSystem(teacherName);
};

window.viewAllTeachers = function() {
    console.log('👥 Professores cadastrados no sistema:');
    console.table(docentesCodprof);
    const total = Object.keys(docentesCodprof).length;
    console.log(`📊 Total de professores: ${total}`);
    console.log(`🔑 FATS compartilhado: ${SHARED_TEACHER_FATS}`);
    return { teachers: docentesCodprof, sharedFats: SHARED_TEACHER_FATS };
};

window.getSharedFats = function() {
    return SHARED_TEACHER_FATS;
};

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

    // Para professores, abre o modal de login para validação do FATS compartilhado
    if((action === 'remove' || action === 'return') && record.curso != "Terceiros") {
        activeAction = { record, action };
        openLogin();
        return;
    }

    // Para terceiros, executa diretamente
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
    // Limpa mensagens de erro anteriores
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value = '';
    
    // Mostra informações sobre a ação
    if(activeAction && activeAction.record) {
        const record = activeAction.record;
        const professorName = record.professor;
        
        // Atualiza o título do modal
        const modalTitle = document.getElementById('loginModalTitle');

        if(modalTitle) {
            modalTitle.textContent = `Validação - ${professorName}`;
        }
        
        const helpMessage = document.getElementById('msg-erro');

        if(helpMessage) {
            helpMessage.innerHTML = `
                <p class="text-info-fast">
                    Digite o FATS compartilhado dos professores para validar a ação:<br>
                    <strong>Professor: ${professorName}</strong><br>
                    <small class="text-muted">Todos os professores usam o mesmo FATS</small>
                </p>
            `;
        }
    }
    
    document.getElementById('loginModal').style.display = 'flex';
    
    // Foca no campo de input e adiciona listener para tecla Enter
    setTimeout(() => {
        const fastInput = document.getElementById('loginFast');

        if(fastInput) {
            fastInput.focus();
            
            const handleEnter = (e) => {
                if(e.key === 'Enter') confirmLogin();
            };
            
            fastInput.addEventListener('keypress', handleEnter);
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
        document.getElementById('msg-erro').textContent = 'Por favor, preencha o FATS ID!';
        return; 
    }

    const record = activeAction ? activeAction.record : null;
    if(!record) {
        document.getElementById('msg-erro').textContent = 'Erro: Registro não encontrado.';
        return;
    }

    const professorName = record.professor;
    
    // Valida usando sistema de FATS compartilhado
    const validation = validateTeacherFats(fastId, professorName);
    
    if(!validation.valid) {
        document.getElementById('msg-erro').textContent = validation.message;
        return;
    }

    // Validação bem-sucedida === fechar modal e executar ação
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('msg-erro').textContent = '';
    document.getElementById('loginFast').value = ''; 

    if(activeAction) { 
        executeKeyAction(activeAction.record, activeAction.action); 
        activeAction = null; 
    }
}

function getFastForProfessor(professorName) {
    if(!professorName || typeof professorName !== 'string') return '';
    
    if(isValidTeacher(professorName)) {
        return SHARED_TEACHER_FATS;
    }
    
    return '';
}

// Funções de gerenciamento de configuração
function updateSharedFats(newFats) {
    if(!newFats || typeof newFats !== 'string') {
        console.error('FATS inválido fornecido');
        return false;
    }
    
    const normalizedFats = newFats.trim().toUpperCase();

    if(normalizedFats.length < 4) {
        console.error('FATS deve ter pelo menos 4 caracteres');
        return false;
    }
    
    SHARED_TEACHER_FATS = normalizedFats;
    localStorage.setItem("sharedTeacherFats", SHARED_TEACHER_FATS);
    
    console.log(`FATS compartilhado atualizado para: ${SHARED_TEACHER_FATS}`);
    return true;
}

// Carrega a configuração ao iniciar
function loadConfiguration() {
    // Carrega os FATS compartilhado
    const savedFats = localStorage.getItem('sharedTeacherFats');
    if (savedFats) {
        SHARED_TEACHER_FATS = savedFats;
        console.log(`📁 FATS compartilhado carregado: ${SHARED_TEACHER_FATS}`);
    }
    
    // Carregar nomes de professores
    loadTeacherNamesFromStorage();
}

// Exportar configuração para uso administrativo
window.exportTeacherConfiguration = function() {
    const config = {
        sharedFats: SHARED_TEACHER_FATS,
        teachers: Object.keys(teacherNames),
        totalTeachers: Object.keys(teacherNames).length,
        lastUpdated: new Date().toISOString()
    };
    
    console.log('Configuração atual do sistema:', config);
    
    if(navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(config, null, 2)).then(() => {
            console.log('Configuração copiada para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar configuração: ', err);
        });
    }
    
    return config;
};

// Função administrativa para alterar FATS compartilhado
window.changeSharedFats = function(newFats) {
    return updateSharedFats(newFats);
};

document.addEventListener('DOMContentLoaded', function() {
    loadConfiguration();
    
    const dateSelector = document.getElementById('teacherDateSelector');
    if (dateSelector) {
        dateSelector.value = selectedDate;
        
        dateSelector.addEventListener('change', async function() {
            const oldDate = selectedDate;
            selectedDate = this.value;
            console.log(`Data alterada de ${oldDate} para ${selectedDate}`);
            
            if (typeof stopSyncDataRealtime === 'function') {
                console.log('[PROFESSOR] 🛑 Parando sincronização da data anterior...');
                stopSyncDataRealtime(oldDate, 'manhã');
                stopSyncDataRealtime(oldDate, 'tarde');
                stopSyncDataRealtime(oldDate, 'noite');
            }
            
            let firebaseLoaded = false;
            if (typeof loadTeacherDataFromFirebase === 'function') {
                console.log(`[PROFESSOR] 🔥 Carregando dados do Firebase para nova data: ${selectedDate}`);
                try {
                    firebaseLoaded = await loadTeacherDataFromFirebase(selectedDate);
                    if (firebaseLoaded) {
                        console.log('[PROFESSOR] ✅ Dados da nova data carregados do Firebase!');
                        
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
            
            if (!firebaseLoaded) {
                console.log('[PROFESSOR] 📁 Verificando localStorage para nova data...');
                const dateData = getDataForDate(selectedDate);
                const shiftData = dateData[activeShift] || [];
                console.log(`Dados encontrados para ${selectedDate} no turno ${activeShift}:`, shiftData);
            }
            
            renderTableForShift(activeShift);
        });
    }

    console.log('[PROFESSOR] ==> Inicializando painel do professor com FATS compartilhado');
    console.log('[PROFESSOR] ==> FATS compartilhado:', SHARED_TEACHER_FATS);
    console.log('[PROFESSOR] ==> Total de professores:', Object.keys(teacherNames).length);
    
    renderTabs();
    
    loadSharedData().then(() => {
        console.log('[PROFESSOR] ==> Dados carregados, renderizando tabela...');
        renderTableForShift(activeShift);
    }).catch(error => {
        console.error('[PROFESSOR] ==> Erro ao carregar dados:', error);
        renderTableForShift(activeShift);
    });
});

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
const dropdown = [
  // Bloco A
  { id: 1, sala: "HIDRÁULICA",  bloco: "Bloco A", numero: "" },
  { id: 2, sala: "AUT PREDIAL", bloco: "Bloco A", numero: "" },

  // Bloco B
  { id: 3, sala: "QUÍMICA",     bloco: "Bloco B", numero: "" },

  // Bloco C
  { id: 4, sala: "FABRICAÇÃO",  bloco: "Bloco C", numero: "" },

  // Bloco D
  { id: 5, sala: "PLANTA CIM",  bloco: "Bloco D", numero: "" },
  { id: 6, sala: "METROLOGIA",  bloco: "Bloco D", numero: "" },
  { id: 7, sala: "LAB MAKER",   bloco: "Bloco D", numero: "" },

  // Bloco E
  { id: 8,  sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "1" },
  { id: 9,  sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "2" },
  { id: 10, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "3" },
  { id: 11, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "4" },
  { id: 12, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "5" },
  { id: 13, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "6" },
  { id: 14, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "7" },
  { id: 15, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "8" },
  { id: 16, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "9" },
  { id: 17, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "10" },
  { id: 18, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "11" },
  { id: 19, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "12" },
  { id: 20, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "13" },
  { id: 21, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "14" },
  { id: 22, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "15" },
  { id: 23, sala: "SALAS TÉRREO", bloco: "Bloco E", numero: "16" },

  // Bloco F
  { id: 24, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "1" },
  { id: 25, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "2" },
  { id: 26, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "3" },
  { id: 27, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "4" },
  { id: 28, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "5" },
  { id: 29, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "6" },
  { id: 30, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "7" },
  { id: 31, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "8" },
  { id: 32, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "9" },
  { id: 33, sala: "LAB DE INFORMÁTICA", bloco: "Bloco F", numero: "10" },

  { id: 34, sala: "LAB ELETROTÉCNICA", bloco: "Bloco F", numero: "11" },
  { id: 35, sala: "SALAS - 2º ANDAR",  bloco: "Bloco F", numero: "12" },
  { id: 36, sala: "LAB ACIONAMENTOS",  bloco: "Bloco F", numero: "13" },
  { id: 37, sala: "SALAS - 2º ANDAR",  bloco: "Bloco F", numero: "14" },
  { id: 38, sala: "LAB ELETRÔNICA",    bloco: "Bloco F", numero: "15" },
  { id: 39, sala: "SALAS - 2º ANDAR",  bloco: "Bloco F", numero: "16" },
  { id: 40, sala: "SALAS - 2º ANDAR",  bloco: "Bloco F", numero: "17" },
  { id: 41, sala: "SALAS - 2º ANDAR",  bloco: "Bloco F", numero: "18" },
  { id: 42, sala: "SALAS - 2º ANDAR",  bloco: "Bloco F", numero: "19" },
  { id: 43, sala: "SALAS - 2º ANDAR",  bloco: "Bloco F", numero: "20" },

  // Bloco G
  { id: 44, sala: "ARMAZENAGEM",        bloco: "Bloco G", numero: "" },
  { id: 45, sala: "SALA DE AUTOMOTIVA", bloco: "Bloco G", numero: "" },
  { id: 46, sala: "MOTOCICLETAS",       bloco: "Bloco G", numero: "" },
  { id: 47, sala: "FUNILARIA",          bloco: "Bloco G", numero: "" },
  { id: 48, sala: "PREDIAL II",         bloco: "Bloco G", numero: "" },

  // Bloco H
  { id: 49, sala: "SALA EMPILHADEIRA",  bloco: "Bloco H", numero: "" },
  { id: 50, sala: "MICROBIOLOGIA",      bloco: "Bloco H", numero: "" },
  { id: 51, sala: "PANIFICAÇÃO",        bloco: "Bloco H", numero: "" }
];

if(!localStorage.getItem("rooms")) {
    localStorage.setItem("rooms", JSON.stringify(dropdown));
}

// Função para obter os dados do dropdown do localStorage ou usar o padrão
function getDropdownData() {
    const stored = localStorage.getItem("rooms");
    return stored ? JSON.parse(stored) : dropdown;
}

// Função para obter blocos únicos a partir dos dados
function getUniqueBlocks(data) {
    const blocks = [ ...new Set(data.map(item => item.bloco))];
    return blocks.sort();
}

// Função para obter nomes de salas únicos de um bloco
function getUniqueRoomsForBlock(data, selectedBlock) {
    const rooms = data
        .filter(item => item.bloco === selectedBlock)
        .map(item => item.sala);

    return [...new Set(rooms)];
}

// Função para obter números de sala de um bloco e sala específicos
function getRoomNumbers(data, selectedBlock, selectedRoom) {
    return data
        .filter(item => item.bloco === selectedBlock && item.sala === selectedRoom)
        .map(item => item.numero)
        .filter(numero => numero !== ""); // Filtra números vazios
}

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

    // Mostrar o badge de modo e botão de alterar o tipo
    document.getElementById('keys-actions-mode').classList.remove('hidden');
    
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

    // Oculta o badge de modo e botão de alterar o tipo
    document.getElementById('keys-actions-mode').classList.add('hidden');
    
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
    const dropdownData = getDropdownData();

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
        const blockRooms = dropdownData.filter(item => item.bloco === block);
        
        if (!blockRooms || blockRooms.length === 0) {
            container.innerHTML = '<div class="empty-keys-message">Nenhuma sala encontrada neste bloco</div>';
            return;
        }
        
        blockRooms.forEach(roomItem => {
            const room = roomItem.sala;
            const roomNumber = roomItem.numero;
            let salaIdentifier;
            
            if(roomNumber && roomNumber !== "") {
                salaIdentifier = `${block} - ${room} - Sala ${roomNumber}`;
            } else {
                salaIdentifier = `${block} - ${room}`;
            }
            
            const isInUse = currentShiftData.some(record => record.sala === salaIdentifier);
            
            const keyItem = createKeySelectionItem(salaIdentifier, isInUse, {
                block: block,
                room: room,
                roomNumber: roomNumber && roomNumber !== "" ? roomNumber : null
            });

            container.appendChild(keyItem);
        });
    } else {
        // Modo single: funcionalidade original (baseada em room selecionada)
        const room = currentSelections.room;
        
        if (!room) {
            container.innerHTML = '<div class="empty-keys-message">Selecione uma sala primeiro</div>';
            return;
        }

        // Encontrar as salas/números disponíveis    
        const numbers = getRoomNumbers(dropdownData, block, room);

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
    const dropdownData = getDropdownData();
    const numbers = getRoomNumbers(dropdownData, block, room);

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
    
    if(selectedText) selectedText.innerText = placeholderText;
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

    // const blocks = Object.keys(dropdown);

    const dropdownData = getDropdownData();
    const blocks = getUniqueBlocks(dropdownData);

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
            // resetDropdown('room-number-dropdown', 'Selecione o número da sala', true);
        });
    });
}

// Função que preenche os dropdowns de "Sala" (segundo dropdown)
function populateRoomDropdown(selectedBlock) {
    const roomDropdown = document.getElementById('room-dropdown');
    const roomOptions = document.getElementById('room-dropdown-op');
    
    if(!roomOptions || !roomDropdown) return;

    // const rooms = dropdown[selectedBlock] || [];

    const dropdownData = getDropdownData();
    const rooms = getUniqueRoomsForBlock(dropdownData, selectedBlock);

    roomOptions.innerHTML = rooms.map(room => `
        <li class="option" data-value="${room}">${room}</li>
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

            // const roomObj = dropdown[selectedBlock].find(room => room.sala === selectedRoom);
            // const numbers = roomObj ? roomObj.numeros : [];
            const numbers = getRoomNumbers(dropdownData, selectedBlock, selectedRoom);

            if(numbers.length > 0) {
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
                    resetDropdown('room-number-dropdown', 'Sem numeração', true);
                    currentSelections.roomNumber = null;
                    roomNumberDropdown.classList.add('noOptions');
                    roomNumberDropdown.classList.remove('hidden');
                    
                    setTimeout(() => {
                        roomNumberDropdown.classList.add('selectedOption');
                    }, 910);
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

    const dropdownData = getDropdownData();
    const numbers = getRoomNumbers(dropdownData, selectedBlock, selectedRoom);

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