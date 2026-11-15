import { useEffect, useState } from "react";
import { getJSON } from "../api";

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp)$/i;

function describe(certificate) {
  const parts = [];
  if (certificate.issuer) parts.push(`Issued by ${certificate.issuer}`);
  if (certificate.date_earned) {
    parts.push(String(certificate.date_earned).slice(0, 4));
  }
  return parts.length ? parts.join(", ") : "Certificate of completion";
}

export default function Achievements() {
  const [certificates, setCertificates] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    getJSON("/api/certificates")
      .then((data) => {
        setCertificates(data);
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Could not load certificates:", error);
        setStatus("error");
      });
  }, []);

  return (
    <section id="achievements">
      <h2>Achievements and certificates</h2>

      {status === "loading" && <p>Loading certificates...</p>}
      {status === "error" && (
        <p>Could not load certificates. Check that the backend and database are running.</p>
      )}

      <div className="grid" style={{ marginTop: "32px" }}>
        {certificates.map((certificate) => {
          const file = certificate.certificate_file;
          const isImage = file && IMAGE_EXTENSIONS.test(file);

          return (
            <div className="card" key={certificate.id}>
              {isImage && (
                <img
                  className="certificate-img"
                  src={file}
                  alt={`${certificate.title} certificate`}
                />
              )}

              <h3>{certificate.title}</h3>
              <p>{describe(certificate)}</p>

              {file && (
                <a
                  className="btn certificate-btn"
                  href={file}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Certificate
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
