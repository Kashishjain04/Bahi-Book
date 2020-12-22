import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import firebase from "../firebase";
import { selectUser } from "../redux/userSlice";
import "../assets/css/AddCustomer.css";
import { Button } from "@material-ui/core";

const db = firebase.firestore;

function AddCustomer({ hideModal }) {
  const _isMounted = useRef(true),
    user = useSelector(selectUser),
    [ID, setID] = useState(""),
    [name, setName] = useState(""),
    [names, setNames] = useState([]),
    [ids, setIds] = useState([]),
    [disabled, disable] = useState(false);

  useEffect(() => {
    db()
      .collection("users")
      .onSnapshot((snap) => {
        const tNames = [];
        snap.forEach((doc) =>
          tNames.push({ id: doc.id, name: doc.data().name })
        );
        setNames(tNames);
      });
    db()
      .collection("users")
      .doc(user.email)
      .collection("customers")
      .onSnapshot((snap) => {
        const tIds = [];
        snap.forEach((doc) => {
          tIds.push(doc.id);
        });
        setIds(tIds);
      });
    return () => {
      _isMounted.current = false;
      setNames([]);
    };
  }, [user.email]);

  const submitHandler = (e) => {
    if (_isMounted) {
      e.preventDefault();
      if (ID === user.email) {
        return alert("Can't add yourself as your customer");
      }
      if (ids.includes(ID)) {
        return alert("Customer already exists");
      }
      hideModal();
      setID("");
      setName("");
      db()
        .collection("users")
        .doc(user.email)
        .collection("customers")
        .doc(ID)
        .set({ name, balance: 0 });
      db()
        .collection("users")
        .doc(ID)
        .set({ name, sent: 0, received: 0 }, { merge: true });
      db()
        .collection("users")
        .doc(ID)
        .collection("customers")
        .doc(user.email)
        .set({ name: user.name, balance: 0 })
        .catch((err) => console.log(err.message));
    }
  };

  const changeID = (e) => {
    const id = e.target.value;
    setID(id);
    disable(false);
    names.forEach((n) => {
      if (n.id === ID) {
        setName(n.name);
        disable(true);
      }
    });
  };

  const form = (
    <form className="add__form" onSubmit={submitHandler}>
      <input
        type="text"
        placeholder="Customer ID"
        value={ID}
        onChange={changeID}
        required
      />
      <input
        type="text"
        placeholder="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={disabled}
        required
      />
      <Button style={{ marginTop: "5px" }} variant="outlined" type="submit">
        Submit
      </Button>
    </form>
  );

  return (
    <div className="add__customer">
      <h2>Add Customer</h2>
      {form}
    </div>
  );
}

export default AddCustomer;
