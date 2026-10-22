import { renderToString } from "react-dom/server";
import App from "./App";
import { SITE_URL } from "./config/site";
export { SITE_URL };
export const render = (url: string) => renderToString(<App url={url} />);
