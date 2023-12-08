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

$ node RoomManagementCLI.js <command> fileToParse [-hts]

<command> :

check : Check if <file> is a valid CRU file
readme : Display the README.txt file
search_room : Search rooms of a specific course
getMaximumCapacityRoom : Display the maximum capacity of a room
searchFreeSlot :  Display the slots available for a room
searchAV : Search available rooms for a specific day and time
export : Export an iCalendar file between two given dates for a specific teaching
room_occupancy : Generate a visualization for the rooms occupancy rates export a Vega-lite chart
room_capacities :  Generate a chart of room types by capacity

<command> : searchAV

-d, --day <day> : The day of available rooms
-e, --timeE <timeE> : The end time of available rooms
-s, --timeS <timeS> : The start time of available rooms

Optional parameters have to be before the mandatory file parameter.

### Version : 

# 1.00

- Parse entièrement un fichier simple CRU avec un cours et plusieurs créneaux 
- Création des classes Schedule, Timeslot et Course (Course étant une collection de Timeslot avec un code cours en plus)




### Liste des contributeurs
A. ABDALA (aya.abdala@utt.fr)
B. ILYASS BOUKHO (ilyass.boukho@utt.fr)
C.Thomas MARTINEZ (thomas.martinez@utt.fr);
D.Jianghao LIU (jianghao.liu@utt.fr);


