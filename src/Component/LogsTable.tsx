import React, { useState, useEffect } from "react";
import Papa from "papaparse";

interface LogEntry {
  id: string;
  user_id: string;
  action: string;
  action1?: string;
  action2?: string;
  action3?: string;
  category: string;
  cat_id: string;
  date: string;
}

const userImages: { [key: string]: string } = {
  "1": "/images/Support-Abdu.jpg",
  "4": "/images/instructor_fawzy.jpg",
  "5": "/images/Support-Aya.jpg",
  "6": "/images/instructor_aml.jpg",
  "9": "/images/esraa.jpg",
  "10": "/images/sohir.jpg",
  "12": "/images/lina.jpg",
  "15": "/images/mohamed kamel.jpg",
  "24": "/images/Abdu.jpg",
  "53": "/images/Adham Usama.jpg",
};

const LogsTable: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSet, setCurrentSet] = useState(0);
  const entriesPerPage = 20;
  const pagesPerSet = 4;

  const fetchLogs = async () => {
    const response = await fetch("/Logs.csv");
    const csvText = await response.text();
    Papa.parse<LogEntry>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<LogEntry>) => {
        const processedData = result.data.map((log: LogEntry) => {
          const [action1, action2] = log.action
            ? log.action.split(/,(.+)/)
            : ["", "", "", ""];
          const action3 = action2 ? action2.trim().split(" ")[0] : "";

          return {
            ...log,
            action1: action1 ? action1.trim() : "",
            action2: action2 ? action2.trim() : "",
            action3: action3,
          };
        });
        setLogs(processedData);
        setFilteredLogs(processedData);
      },
    });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = logs.filter(
        (log) =>
          log.id.includes(searchTerm) ||
          log.user_id.includes(searchTerm) ||
          log.action1?.includes(searchTerm) ||
          log.action2?.includes(searchTerm) ||
          log.action3?.includes(searchTerm) ||
          log.category.includes(searchTerm) ||
          log.cat_id.includes(searchTerm) ||
          log.date.includes(searchTerm)
      );
      setFilteredLogs(filtered);
      setCurrentPage(1);
    } else {
      setFilteredLogs(logs);
    }
  }, [searchTerm, logs]);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredLogs.slice(indexOfFirstEntry, indexOfLastEntry);

  const totalPages = Math.ceil(filteredLogs.length / entriesPerPage);

  const startPage = currentSet * pagesPerSet + 1;
  const endPage = Math.min(startPage + pagesPerSet - 1, totalPages);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextSet = () => {
    if (endPage < totalPages) {
      setCurrentSet(currentSet + 1);
    }
  };

  const handlePreviousSet = () => {
    if (currentSet > 0) {
      setCurrentSet(currentSet - 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={index} style={{ color: "red" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <i className="fa fa-search search-icon"></i>
      </div>
      <table className="u">
        <thead className="thead-dark">
          <tr>
            <th>ID</th>
            <th>USER ID</th>
            <th>MODIFIED BY</th>
            <th>ACTION</th>
            <th>DETAILS</th>
            <th>CATEGORY</th>
            <th>CAT ID</th>
            <th className="date">
              DATE OF CHANGE
              <span>
                <i className="fa-solid fa-calendar-days p-0 m-0 mx-3"></i>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {currentEntries.map((log) => (
            <tr key={log.id}>
              <td>{highlightSearchTerm(log.id)}</td>
              <td>{highlightSearchTerm(log.user_id)}</td>
              <td className="modified-by d-flex align-items-center ">
                <img
                  src={userImages[log.user_id] || "/images/default.jpeg"}
                  alt={`Instructor ${log.user_id}`}
                  className="instructor-image"
                />
                {highlightSearchTerm(log.action1 || "")}
              </td>
              <td>{highlightSearchTerm(log.action3 || "")}</td>
              <td>{highlightSearchTerm(log.action2 || "")}</td>
              <td>{highlightSearchTerm(log.category)}</td>
              <td>{highlightSearchTerm(log.cat_id)}</td>
              <td>{highlightSearchTerm(log.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <div className="d">
          {currentSet > 0 && (
            <button
              className="pagination-button border rounded-3"
              onClick={handlePreviousSet}
            >
              <i className="fa-solid fa-angles-left"></i>
            </button>
          )}
          {Array.from({ length: endPage - startPage + 1 }, (_, index) => (
            <button
              key={startPage + index}
              onClick={() => handlePageChange(startPage + index)}
              className={`pagination-button border rounded-3 ${
                currentPage === startPage + index ? "active" : ""
              }`}
            >
              {startPage + index}
            </button>
          ))}
          {endPage < totalPages && (
            <button
              className="pagination-button border rounded-3"
              onClick={handleNextSet}
            >
              <i className="fa-solid fa-angles-right"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogsTable;
