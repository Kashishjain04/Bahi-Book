import { Statistic } from "antd";
import React from "react";
import "../assets/css/TransactionCard.css";

function DisplayTransaction({ details }) {
  return (
    <div className="trans__card">
      <p className="trans__time">
        {new Date(details.timestamp?.toDate()).toLocaleString()}
      </p>
      <div className="trans__details">
        <Statistic
          className={
            details.amount >= 0
              ? "positive trans__amount"
              : "negative trans__amount"
          }
          value={Math.abs(details.amount)}
        />
        {details.receipt !== "" && (
          <a rel="noreferrer" href={details.receipt} target="_blank">
            <img className="trans__img" src={details.receipt} alt="receipt" />
          </a>
        )}
      </div>
    </div>
  );
}

export default DisplayTransaction;
