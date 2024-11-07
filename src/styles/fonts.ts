import localFont from "next/font/local";

export const TestMartinaPlantijn = localFont({
  src: [
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-black-italic.woff2",
      weight: "900",
      style: "italic",
    },
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-black.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-bold-italic.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-light-italic.woff2",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-medium-italic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Test Martina Plantijn/test-martina-plantijn-regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-test-martina-plantijn",
});

export const TestMartinaPlantijnClass = TestMartinaPlantijn.variable;
