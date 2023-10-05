// QUICK AND DIRTY
// REPLACE FIGMA TEXT STYLES CONSISTING OF ONE TYPEFACE WITH ANOTHER
// MAKE SURE TO DUPLICATE YOUR PROJECT BEFORE TRYING

// Utility func: Only unique values in an array
const onlyUnique = (e: any, i: number, a: any[]) => a.indexOf(e) === i

// Inter Extra Bold <-> Poppins ExtraBold
const newFamily = "Poppins"
const styleNameTransform = (oldStyle: string) => oldStyle.split(" ").join("")

// Poppins ExtraBold <-> Inter Extra Bold
// const newFamily = "Inter"
// const styleNameTransform = (oldStyle: string) => oldStyle.replace(/([A-Z])/g, " $1").slice(1)

const currentTextStyles = figma.getLocalTextStyles()

// Check whether every font style exists in the new family:
const currentFamilies = currentTextStyles
	.map((f) => f.fontName.family)
	.filter(onlyUnique)

// List all used font styles
const currentFontStyles = currentTextStyles
	.map((s) => styleNameTransform(s.fontName.style))
	.filter(onlyUnique)

const makeChecks = async () => {
	// Make sure there is only one family
	const isThereOnlyOneFamily = currentFamilies.length === 1
	if (!isThereOnlyOneFamily) {
		return `THERE IS MORE THAN ONE FAMILY
			currentFamilies: ${currentFamilies.join(" | ")}
			${{ newFamily }}
			`
	}

	const newFontStyles = await figma
		.listAvailableFontsAsync()
		.then((availableFonts) =>
			availableFonts.filter((font) => font.fontName.family == newFamily)
		)

	const isEveryFontStyleAvailable = currentFontStyles.every(
		(fontStyle) =>
			newFontStyles.map((f) => f.fontName.style).indexOf(fontStyle) >= 0
	)

	if (!isEveryFontStyleAvailable) {
		return `NOT ALL FONT STYLES FROM ${currentFamilies[0]}
		ARE AVAILABLE IN ${newFamily}
		----
${newFontStyles
	.filter((font) => currentFontStyles.indexOf(font.fontName.style) < 0)
	.map((e) => e.fontName.style)}
		`
	}

	return `ok`
}
makeChecks()
	.then((everything) => {
		if (everything === `ok`) {
			console.info("CHECKS OK")
			console.info("TRYING TO REPLACE")
			replaceTextStyles()
		} else {
			console.error("FAILED")
			console.warn(everything)
		}
	})
	.catch((e) => console.log(e))

const replaceTextStyles = async () =>
	currentTextStyles.map(async (o) => {
		console.log("running")
		const newStyle = figma.createTextStyle()

		await figma.loadFontAsync({
			family: newFamily,
			style: styleNameTransform(o.fontName.style),
		})

		newStyle.description = o.description
		newStyle.documentationLinks = o.documentationLinks
		newStyle.fontName = {
			family: newFamily,
			style: styleNameTransform(o.fontName.style),
		}
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

		o.consumers.map((a) => {
			let textLayer = figma.getNodeById(a.node.id)
			if (textLayer && textLayer.type == "TEXT") {
				textLayer.textStyleId = newStyle.id
			}
		})

		// REMOVE OLD STYLE
		figma.getStyleById(o.id)?.remove()
	})

console.log("closePlugin")
figma.closePlugin
