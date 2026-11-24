<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>
<qgis version="3.44.12-Solothurn" styleCategories="Symbology|Labeling">
  <renderer-v2 type="singleSymbol" symbollevels="0" enableorderby="0" forceraster="0">
    <symbols>
      <symbol name="0" type="fill" alpha="0.78">
        <layer class="SimpleFill">
          <Option type="Map">
            <Option name="color" value="226,232,240,255" type="QString"/>
            <Option name="outline_color" value="51,65,85,255" type="QString"/>
            <Option name="outline_width" value="0.45" type="QString"/>
          </Option>
        </layer>
      </symbol>
    </symbols>
  </renderer-v2>
  <labeling type="simple">
    <settings calloutType="simple">
      <text-style fieldName="codigo || ' (' || COALESCE(area_m2, 0) || ' m²)'" isExpression="1" fontSize="8" textColor="15,23,42,255"/>
    </settings>
  </labeling>
</qgis>
