import React, { useState } from "react";
import { marked } from "marked";
import { useSnackbar } from "notistack";

const App = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [jsonData, setJsonData] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [renderType, setRenderType] = useState("html"); // Either 'html' or 'markdown'

  // Access the enqueueSnackbar function from notistack
  const { enqueueSnackbar } = useSnackbar();

  const fetchApiData = async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setJsonData(JSON.stringify(data, null, 2));

      enqueueSnackbar("Data fetched successfully", { variant: "success" });
      setJsonError("");
    } catch (error) {
      enqueueSnackbar("Error fetching data", { variant: "error" });
      setJsonError("Invalid API URL or request failed.");
    }
  };

  const handleJsonChange = (event) => {
    try {
      const newJson = event.target.value;
      setJsonData(newJson);
      JSON.parse(newJson);
      setJsonError("");
    } catch (error) {
      setJsonError("Malformed JSON data");
      enqueueSnackbar("Malformed JSON data", { variant: "error" });
    }
  };

  // Function to render JSON data as appropriate HTML elements
  const renderHtmlData = (data) => {
    if (typeof data === "object" && !Array.isArray(data)) {
      return (
        <div>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} style={{ marginBottom: "10px" }}>
              <strong>{key}:</strong> {renderHtmlData(value)}
            </div>
          ))}
        </div>
      );
    } else if (Array.isArray(data)) {
      return (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{renderHtmlData(item)}</li>
          ))}
        </ul>
      );
    } else {
      return <span>{data}</span>; // Simple value display
    }
  };

  // Render JSON data as HTML or Markdown
  const renderJson = () => {
    try {
      const parsedJson = JSON.parse(jsonData);

      if (renderType === "html") {
        // Render as structured HTML
        return <div>{renderHtmlData(parsedJson)}</div>;
      } else {
        // Render as Markdown
        const markdown = marked(JSON.stringify(parsedJson, null, 2));
        return <div dangerouslySetInnerHTML={{ __html: markdown }} />;
      }
    } catch (error) {
      return <p>Invalid JSON format</p>;
    }
  };

  return (
    <div className="app" style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>API and JSON Interaction Tool</h1>

      {/* API Input */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter API Endpoint"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          style={{ padding: "8px", width: "70%", marginRight: "10px" }}
        />
        <button onClick={fetchApiData} style={{ padding: "8px 12px", cursor: "pointer" }}>GET</button>
      </div>

      {/* JSON Display / Manual Edit */}
      <div style={{ marginBottom: "20px" }}>
        <h2>JSON Data</h2>
        <textarea
          value={jsonData}
          onChange={handleJsonChange}
          rows="10"
          cols="50"
          style={{ width: "100%", padding: "10px" }}
        />
        {jsonError && <p style={{ color: "red" }}>{jsonError}</p>}
      </div>

      {/* Select Render Type */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ marginRight: "10px" }}>
          <input
            type="radio"
            name="renderType"
            value="html"
            checked={renderType === "html"}
            onChange={() => setRenderType("html")}
          />
          Render as HTML
        </label>
        <label>
          <input
            type="radio"
            name="renderType"
            value="markdown"
            checked={renderType === "markdown"}
            onChange={() => setRenderType("markdown")}
          />
          Render as Markdown
        </label>
      </div>

      {/* Render Output */}
      <div>
        <h2>Rendered Output</h2>
        {renderJson()}
      </div>
    </div>
  );
};

export default App;