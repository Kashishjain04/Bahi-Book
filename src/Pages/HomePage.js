import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/userSlice";
import firebase from "../firebase";
import DisplayCustomer from "../Components/DisplayCustomer";
import AddCustomer from "../Components/AddCustomer";
import AddCustomerCard from "../Components/AddCard";
import { Avatar, IconButton, Modal } from "@material-ui/core";
import { LogoutOutlined } from "@ant-design/icons";
import "../assets/css/Home.css";
import HomeStats from "../Components/HomeStats";
import CustomerLoadingCard from "../Components/CustomerLoadingCard";

const db = firebase.firestore,
  auth = firebase.auth,
  messaging = firebase.messaging;

function HomePage() {
  const _isMounted = useRef(true),
    user = useSelector(selectUser),
    [sent, setSent] = useState(0),
    [received, setReceived] = useState(0),
    [customers, setCustomers] = useState([]),
    [modalVisible, setModalVisible] = useState(false),
    [custLoading, setCustLoading] = useState(true);

  useEffect(() => {
    Notification.requestPermission().catch((err) => console.log(err.code));
    messaging()
      .getToken()
      .then((token) => {
        db()
          .collection("users")
          .doc(user.email)
          .update({
            fcmTokens: firebase.firestore.FieldValue.arrayUnion(token),
          });
      })
      .catch((err) => {
        console.log(err.code);
      });
    db()
      .collection("users")
      .doc(user.email)
      .onSnapshot((snap) => {
        setSent(snap.data()?.sent);
        setReceived(snap.data()?.received);
      });
    db()
      .collection("users")
      .doc(user.email)
      .collection("customers")
      .onSnapshot((snap) => {
        const cst = [];
        snap.forEach((doc) => {
          cst.push({
            id: doc.id,
            name: doc.data().name,
            balance: doc.data().balance,
          });
        });
        setCustomers(cst);
        setCustLoading(false);
      });
    return () => {
      _isMounted.current = false;
      setCustomers([]);
      setCustLoading(true);
    };
  }, [user]);

  const logout = () => {
    auth()
      .signOut()
      .catch((err) => console.log(err.message));
  };

  return (
    <div className="home">
      <div className="head">
        <Avatar className="avatar" alt={user.name} src={user.image} />
        <h2 className="head__text">{user.name}</h2>
        <IconButton className="logout" onClick={logout}>
          <LogoutOutlined />
        </IconButton>
      </div>
      <HomeStats sent={sent} received={received} />
      <h1 className="subheading">Customers</h1>
      <div className="customers">
        {custLoading === false ? (
          <>
            {customers.map((cust) => (
              <DisplayCustomer key={cust.id} details={cust} />
            ))}
            <AddCustomerCard onClick={() => setModalVisible(true)} />
          </>
        ) : (
          <CustomerLoadingCard />
        )}
      </div>
      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        aria-labelledby="add-customer"
        aria-describedby="simple-modal-description"
      >
        <AddCustomer hideModal={() => setModalVisible(false)} />
      </Modal>
    </div>
  );
}

export default HomePage;
