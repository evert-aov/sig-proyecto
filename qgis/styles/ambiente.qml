<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="3.44.12-Solothurn" styleCategories="Symbology|Labeling">
  <renderer-v2 type="categorizedSymbol" attr="tipo_codigo" symbollevels="0" enableorderby="0" forceraster="0">
    <categories>
      <category symbol="0" value="CENTRO_INTERNO" label="Centro Interno (#CF222E)" render="true"/>
      <category symbol="1" value="CONSULTORIO" label="Consultorio Médico (#DB2777)" render="true"/>
      <category symbol="2" value="ENFERMERIA" label="Enfermería (#DB2777)" render="true"/>
      <category symbol="3" value="OFICINA" label="Oficina Administrativa (#1F6FEB)" render="true"/>
      <category symbol="4" value="LABORATORIO" label="Laboratorio (#8250DF)" render="true"/>
      <category symbol="5" value="BIBLIOTECA" label="Biblioteca (#8250DF)" render="true"/>
      <category symbol="6" value="KIOSCO" label="Quiosco / Servicio (#BC4C00)" render="true"/>
    </categories>
    <symbols>
      <symbol name="0" type="marker" alpha="1"><layer class="SimpleMarker"><Option type="Map"><Option name="color" value="207,34,46,255" type="QString"/><Option name="outline_color" value="255,255,255,255" type="QString"/><Option name="outline_width" value="0.6" type="QString"/><Option name="size" value="4.2" type="QString"/></Option></layer></symbol>
      <symbol name="1" type="marker" alpha="1"><layer class="SimpleMarker"><Option type="Map"><Option name="color" value="219,39,119,255" type="QString"/><Option name="name" value="cross2" type="QString"/><Option name="size" value="4.0" type="QString"/></Option></layer></symbol>
      <symbol name="2" type="marker" alpha="1"><layer class="SimpleMarker"><Option type="Map"><Option name="color" value="219,39,119,255" type="QString"/><Option name="name" value="cross" type="QString"/><Option name="size" value="4.0" type="QString"/></Option></layer></symbol>
      <symbol name="3" type="marker" alpha="1"><layer class="SimpleMarker"><Option type="Map"><Option name="color" value="31,111,235,255" type="QString"/><Option name="size" value="3.4" type="QString"/></Option></layer></symbol>
      <symbol name="4" type="marker" alpha="1"><layer class="SimpleMarker"><Option type="Map"><Option name="color" value="130,80,223,255" type="QString"/><Option name="size" value="3.4" type="QString"/></Option></layer></symbol>
      <symbol name="5" type="marker" alpha="1"><layer class="SimpleMarker"><Option type="Map"><Option name="color" value="130,80,223,255" type="QString"/><Option name="size" value="3.4" type="QString"/></Option></layer></symbol>
      <symbol name="6" type="marker" alpha="1"><layer class="SimpleMarker"><Option type="Map"><Option name="color" value="188,76,0,255" type="QString"/><Option name="size" value="3.4" type="QString"/></Option></layer></symbol>
    </symbols>
  </renderer-v2>
  <labeling type="simple">
    <settings calloutType="simple">
      <text-style fieldName="codigo" fontSize="8" textColor="31,41,55,255"/>
    </settings>
  </labeling>
</qgis>
