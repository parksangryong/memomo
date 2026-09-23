import Guide from "./Guide";
import { createBrowserRouter, createMemoryRouter, RouterProvider } from "react-router-dom";
import ReactGA4 from "react-ga4";
import { useEffect } from "react";
// pages
import Home from "./page/Home";
import CardFlip from "./page/CardFlip";
import Privacy from "./page/Privacy";

// layout
import BaseLayout from "./layout/BaseLayout";

function App({ url }: { url?: string }) {
  useEffect(() => {
    ReactGA4.initialize([
      {
        trackingId: "G-85STCFYNCW", //받은 키
        gaOptions: {
          siteSpeedSampleRate: 100,
        },
      },
    ]);
  }, []);
  const routes = [
    {
      path: "/",
      element: <BaseLayout />,
      children: [
        {
          path: "/",
          element: <Home />,
        },
        {
          path: "/card-flip",
          element: <CardFlip />,
        },
        { path: "/privacy", element: <Privacy /> },
    { path: "/guide", element: <Guide /> },
      ],
    },
  ];
  const router = url ? createMemoryRouter(routes, { initialEntries: [url] }) : createBrowserRouter(routes);
  return <RouterProvider router={router} />;
}

export default App;
