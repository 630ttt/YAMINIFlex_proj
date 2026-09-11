import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";

const PhonePeCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("Verifying your payment...");
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = searchParams.get("orderId");
      const merchantOrderId = searchParams.get("merchantOrderId");

      if (!orderId || !merchantOrderId) {
        setError("Invalid payment response.");
        return;
      }

      try {
        setStatus("Verifying your payment...");

        const response = await api.post("/payments/phonepe/verify", {
          orderId,
          merchantOrderId,
        });

        if (response.data?.paid === true) {
          sessionStorage.removeItem("yaminiflex_order_draft");

          setStatus("Payment successful! Redirecting...");

          setTimeout(() => {
            navigate("/my-account", { replace: true });
          }, 1000);
        } else {
          setError(
            response.data?.message ||
              "Payment could not be confirmed."
          );
        }
      } catch (error) {
        console.error("PhonePe verification error:", error);

        setError(
          error.response?.data?.message ||
            "Unable to verify the payment. Please contact support."
        );
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          textAlign: "center",
          padding: "40px 30px",
          borderRadius: "16px",
          background: "#fff",
          boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        }}
      >
        {!error ? (
          <>
            <div
              style={{
                width: "55px",
                height: "55px",
                margin: "0 auto 20px",
                border: "5px solid #eee",
                borderTop: "5px solid #6b7d45",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />

            <h2
              style={{
                marginBottom: "10px",
                color: "#333",
              }}
            >
              {status}
            </h2>

            <p style={{ color: "#777" }}>
              Please do not close or refresh this page.
            </p>

            <style>
              {`
                @keyframes spin {
                  from {
                    transform: rotate(0deg);
                  }
                  to {
                    transform: rotate(360deg);
                  }
                }
              `}
            </style>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: "50px",
                marginBottom: "15px",
              }}
            >
              ⚠️
            </div>

            <h2
              style={{
                color: "#b42318",
                marginBottom: "12px",
              }}
            >
              Payment Verification Failed
            </h2>

            <p
              style={{
                color: "#666",
                lineHeight: "1.6",
              }}
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() => navigate("/account")}
              style={{
                marginTop: "20px",
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                background: "#6b7d45",
                color: "#fff",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              Go to My Account
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PhonePeCallback;