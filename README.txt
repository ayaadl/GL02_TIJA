### README 

CRU file format : 

<course> = +(<course>)
<course> = "+" <name> <eol> <list_timeslot> <eol>
<body> = ‘+’ Code CRLF 1*Timeslot
<list_timeslot> = liste des séances
<type> = DIGIT ‘,’ ALPHA DIGIT
<capacity> = 'P=' 1*DIGIT
<daytime> = ‘H=’ <day> WSP <hour> 
<subgroup> = ALPHA DIGIT
<room> = ‘S=’ ALPHA 3DIGIT


### Installation

$ npm install

### Utilisation :

$ node caporalCli.js <command> fileToParse [-hts]

<command> : check

-h or --help 	:	 display the program help
-t or --showTokenize :	 display the tokenization result 
-s or --showSymbols :	 display each step of the analysis

Optional parameters have to be before the mandatory file parameter.

### Version : 

# 0.01

- Parse entièrement un fichier simple CRU avec un cours et plusieurs créneaux 
- Création des classes Schedule, Timeslot et Course (Course étant une collection de Timeslot avec un code cours en plus)


TODO :
- Compléter les fonctions des différentes classes (Schedule, Timeslot, Course)
- Ajout des fonctionnalités/command de l'application via SRURoomManagementCLI.js 
- Ajout de tests unitaires


### Liste des contributeurs
A. ABDALA (aya.abdala@utt.fr)


