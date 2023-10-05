// QUICK AND DIRTY
// REPLACE FIGMA TEXT STYLES CONSISTING OF ONE TYPEFACE WITH ANOTHER
// MAKE SURE TO DUPLICATE YOUR PROJECT BEFORE TRYING

const styles = figma.getLocalTextStyles().map(async o=>{
	const newStyle = figma.createTextStyle()

	// Inter Extra Bold <-> Poppins ExtraBold
	const styleNameRule = (oldStyle: string) => oldStyle.split(' ').join('')
	
	await figma.loadFontAsync({family: `Poppins`, style: styleNameRule(o.fontName.style)})

	newStyle.description = o.description
	newStyle.documentationLinks = o.documentationLinks
	newStyle.fontName = { family: 'Poppins', style: styleNameRule(o.fontName.style) }
	newStyle.fontSize = o.fontSize
	newStyle.hangingList = o.hangingList
	newStyle.hangingPunctuation = o.hangingPunctuation
	newStyle.letterSpacing = o.letterSpacing
	newStyle.leadingTrim = o.leadingTrim
	newStyle.lineHeight = o.lineHeight
	newStyle.listSpacing = o.listSpacing
	newStyle.name = o.name
	newStyle.textCase = o.textCase
	newStyle.textDecoration = o.textDecoration
	newStyle.paragraphIndent = o.paragraphIndent
	newStyle.paragraphSpacing = o.paragraphSpacing
	
	// no setters:
	// newStyle.type = o.type
	
	o.consumers.map(a=> {
		let textLayer = figma.getNodeById(a.node.id)
		if(textLayer && textLayer.type == "TEXT") {
			textLayer.textStyleId = newStyle.id
		}
	})
	
	// REMOVE OLD STYLE
	figma.getStyleById(o.id)?.remove()

})

console.log('done')
figma.closePlugin