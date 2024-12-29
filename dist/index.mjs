// node_modules/tsup/assets/esm_shims.js
import { fileURLToPath } from "url";
import path from "path";

const getFilename = () => fileURLToPath(import.meta.url);
const getDirname = () => path.dirname(getFilename());
const __dirname = getDirname();

// src/functions/generateSvg.ts
const generateSvg = (svgContent) => `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

// src/functions/registerFont.ts
import { GlobalFonts } from "@napi-rs/canvas";
import fs from "fs";

function registerFont(fontPath, fontName) {
  const fontPaths = [
    path.join(__dirname, "../fonts", fontPath),
    path.join(__dirname, "../fonts", fontPath)
  ];

  for (const rootFontsPath of fontPaths) {
    if (fs.existsSync(rootFontsPath)) {
      GlobalFonts.registerFromPath(rootFontsPath, fontName);
      return;
    }
  }
  throw new Error(`Font file not found at ${fontPaths.join(' or ')}`);
}

// src/themes/classic.ts
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { cropImage } from "cropify";

const fonts = [
  { path: "PlusJakartaSans-Bold.ttf", name: "bold" },
  { path: "PlusJakartaSans-ExtraBold.ttf", name: "extrabold" },
  { path: "PlusJakartaSans-ExtraLight.ttf", name: "extralight" },
  { path: "PlusJakartaSans-Light.ttf", name: "light" },
  { path: "PlusJakartaSans-Medium.ttf", name: "medium" },
  { path: "PlusJakartaSans-Regular.ttf", name: "regular" },
  { path: "PlusJakartaSans-SemiBold.ttf", name: "semibold" },
];

fonts.forEach(font => registerFont(font.path, font.name));

const Classic = async (option) => {
  const defaultOptions = {
    progress: 10,
    name: "Musicard",
    author: "By Unburn",
    startTime: "0:00",
    endTime: "0:00",
    progressBarColor: "#5F2D00",
    progressColor: "#FF7A00",
    backgroundColor: "#070707",
    nameColor: "#FF7A00",
    authorColor: "#FFFFFF",
    timeColor: "#FFFFFF",
    imageDarkness: 10,
  };

  option = { ...defaultOptions, ...option };

  const noImageSvg = generateSvg(`
    <svg width="837" height="837" xmlns="http://www.w3.org/2000/svg">
      <rect width="837" height="837" fill="${option.progressColor}"/>
      <path d="M419.324 635.912C406.035 635.912 394.658 631.18 385.195 621.717C375.732 612.254 371 600.878 371 587.589C371 574.3 375.732 562.923 385.195 553.46C394.658 543.997 406.035 539.265 419.324 539.265C432.613 539.265 443.989 543.997 453.452 553.46C462.915 562.923 467.647 574.3 467.647 587.589C467.647 600.878 462.915 612.254 453.452 621.717C443.989 631.18 432.613 635.912 419.324 635.912ZM371 490.941V201H467.647V490.941H371Z" fill="${option.backgroundColor}"/>
    </svg>
  `);

  const thumbnailImage = option.thumbnailImage || noImageSvg;
  const thumbnail = await loadImage(thumbnailImage);

  option.progress = Math.max(10, Math.min(option.progress, 100));
  option.imageDarkness = Math.max(0, Math.min(option.imageDarkness, 100));
  option.name = option.name.length > 18 ? `${option.name.slice(0, 18)}...` : option.name;
  option.author = option.author.length > 18 ? `${option.author.slice(0, 18)}...` : option.author;

  const canvas = createCanvas(2458, 837);
  const ctx = canvas.getContext("2d");

  let background;
  if (!option.backgroundImage) {
    const backgroundSvg = generateSvg(`
      <svg width="2458" height="837" xmlns="http://www.w3.org/2000/svg">
        <rect width="1568" height="512" rx="50" fill="${option.backgroundColor}"/>
        <rect y="565" width="1568" height="272" rx="50" fill="${option.backgroundColor}"/>
      </svg>
    `);
    background = await loadImage(backgroundSvg);
    ctx.drawImage(background, 0, 0);
  } else {
    try {
      const image = await loadImage(option.backgroundImage);
      const darknessSvg = generateSvg(`
        <svg width="1568" height="837" xmlns="http://www.w3.org/2000/svg">
          <rect width="1568" height="512" rx="50" fill="#070707" fill-opacity="${option.imageDarkness / 100}"/>
          <rect y="565" width="1568" height="272" rx="50" fill="#070707" fill-opacity="${option.imageDarkness / 100}"/>
        </svg>
      `);

      await Promise.all([
        cropImage({ imagePath: image, x: 0, y: -170, width: 1568, height: 512, borderRadius: 50 })
          .then(cropped => ctx.drawImage(cropped, 0, 0)),
        cropImage({ imagePath: image, x: 0, y: -845, width: 1568, height: 272, borderRadius: 50 })
          .then(cropped => ctx.drawImage(cropped, 0, 565)),
      ]);
      
      ctx.drawImage(await loadImage(darknessSvg), 0, 0);
    } catch {
      const backgroundSvg = generateSvg(`
        <svg width="2458" height="837" xmlns="http://www.w3.org/2000/svg">
          <rect width="1568" height="512" rx="50" fill="${option.backgroundColor}"/>
          <rect y="565" width="1568" height="272" rx="50" fill="${option.backgroundColor}"/>
        </svg>
      `);
      background = await loadImage(backgroundSvg);
      ctx.drawImage(background, 0, 0);
    }
  }

  ctx.drawImage(thumbnail, 1621, 0);
  const completed = (1342 * option.progress) / 100;
  const progressBarSvg = generateSvg(`
    <svg width="1342" height="76" xmlns="http://www.w3.org/2000/svg">
      <rect y="13" width="1342" height="47" rx="20" fill="${option.progressBarColor}"/>
      <rect y="13" width="${completed}" height="47" rx="20" fill="${option.progressColor}"/>
      <rect x="${completed - 40}" y="3" width="69.4422" height="69.4422" rx="34.7211" fill="${option.progressColor}" stroke="${option.backgroundColor}" stroke-width="6"/>
    </svg>
  `);
  const progressBar = await loadImage(progressBarSvg);
  ctx.drawImage(progressBar, 113, 635);

  ctx.fillStyle = option.nameColor;
  ctx.font = "124px extrabold";
  ctx.fillText(option.name, 113, 230);

  ctx.fillStyle = option.authorColor;
  ctx.font = "87px regular";
  ctx.fillText(option.author, 113, 370);

  ctx.fillStyle = option.timeColor;
  ctx.font = "50px semibold";
  ctx.fillText(option.startTime, 113, 768);
  ctx.fillText(option.endTime, 1332, 768);

  const buffer = await canvas.encode("png");
  return buffer;
};

export { Classic };