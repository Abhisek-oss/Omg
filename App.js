import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { Provider as PaperProvider, DefaultTheme, DarkTheme } from "react-native-paper";
import * as Localization from "expo-localization";
import i18n from "i18n-js";

// --- Localization Setup ---
i18n.translations = {
  en: {
    welcome: "Welcome",
    login: "Login",
    register: "Register",
    logout: "Logout",
    email: "Email",
    password: "Password",
    username: "Username",
    profile: "Profile",
    uploadPhoto: "Upload Photo",
    takePhoto: "Take Photo",
    updateProfile: "Update Profile",
    buses: "Buses",
    bookSeat: "Book Seat",
    bookingHistory: "Booking History",
    seatSelected: "Seat Selected:",
    adminPanel: "Admin Panel",
    addBus: "Add Bus",
    busName: "Bus Name",
    from: "From",
    to: "To",
    date: "Date (YYYY-MM-DD)",
    time: "Time (HH:mm)",
    seatCount: "Total Seats",
    price: "Price per Seat",
    submit: "Submit",
    selectSeat: "Select Your Seat",
    seatUnavailable: "Seat is already booked!",
    themeToggle: "Toggle Dark/Light Theme",
    languageToggle: "Switch Language",
    loading: "Loading...",
  },
  hi: {
    welcome: "स्वागत है",
    login: "लॉगिन",
    register: "रजिस्टर करें",
    logout: "लॉग आउट",
    email: "ईमेल",
    password: "पासवर्ड",
    username: "उपयोगकर्ता नाम",
    profile: "प्रोफ़ाइल",
    uploadPhoto: "फोटो अपलोड करें",
    takePhoto: "फोटो लें",
    updateProfile: "प्रोफ़ाइल अपडेट करें",
    buses: "बसें",
    bookSeat: "सीट बुक करें",
    bookingHistory: "बुकिंग इतिहास",
    seatSelected: "चयनित सीट:",
    adminPanel: "एडमिन पैनल",
    addBus: "बस जोड़ें",
    busName: "बस का नाम",
    from: "से",
    to: "तक",
    date: "तारीख (YYYY-MM-DD)",
    time: "समय (HH:mm)",
    seatCount: "कुल सीटें",
    price: "प्रति सीट मूल्य",
    submit: "सबमिट करें",
    selectSeat: "अपनी सीट चुनें",
    seatUnavailable: "सीट पहले से बुक है!",
    themeToggle: "डार्क/लाइट थीम बदलें",
    languageToggle: "भाषा बदलें",
    loading: "लोड हो रहा है...",
  },
  mai: {
    welcome: "स्वागत",
    login: "लगइन",
    register: "पंजीकरण",
    logout: "लॉग आउट",
    email: "ईमेल",
    password: "पासवर्ड",
    username: "यूजरनेम",
    profile: "प्रोफाइल",
    uploadPhoto: "फोटो अपलोड करू",
    takePhoto: "फोटो खींचू",
    updateProfile: "प्रोफाइल अपडेट करू",
    buses: "बस",
    bookSeat: "सीट बुक करू",
    bookingHistory: "बुकिंग इतिहास",
    seatSelected: "चयनित सीट:",
    adminPanel: "एडमिन पैनल",
    addBus: "बस जोड़ू",
    busName: "बस के नाम",
    from: "से",
    to: "तक",
    date: "तारीख (YYYY-MM-DD)",
    time: "समय (HH:mm)",
    seatCount: "कुल सीट",
    price: "प्रति सीट दाम",
    submit: "सबमिट करू",
    selectSeat: "सीट चुनू",
    seatUnavailable: "सीट पहिले से बुक छि!",
    themeToggle: "डार्क/लाइट थीम बदली",
    languageToggle: "भाषा बदली",
    loading: "लोड भ' रहल अछि...",
  },
};
i18n.locale = Localization.locale.split("-")[0];
i18n.fallbacks = true;

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyDQqYOzS9ayO1rwBnB7oUtnOPbduwKN_-Y",
  authDomain: "busticketbookingapp.firebaseapp.com",
  projectId: "busticketbookingapp",
  storageBucket: "busticketbookingapp.appspot.com",
  messagingSenderId: "1045249778101",
  appId: "1:1045249778101:android:e9182f8109f49f237339fc",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const IMGUR_CLIENT_ID = "bf9161f8d311d46";

// --- App Component ---
export default function App() {
  // Auth state
  const [user, setUser] = useState(null);

  // UI & inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState("https://i.imgur.com/itTlcDE.png");
  const [uploading, setUploading] = useState(false);

  // Data states
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);

  // UI
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [themeDark, setThemeDark] = useState(false);
  const [language, setLanguage] = useState(i18n.locale);

  // --- Language toggle handler ---
  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : language === "hi" ? "mai" : "en";
    i18n.locale = newLang;
    setLanguage(newLang);
  };

  // --- Theme toggle ---
  const toggleTheme = () => {
    setThemeDark((prev) => !prev);
  };

  // --- Firebase Auth Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", u.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || "");
          setProfileImage(data.photo || "https://i.imgur.com/itTlcDE.png");
          setIsAdmin(data.admin || false);
        }
        // Fetch bookings for this user
        fetchBookings(u.uid);
        fetchBuses();
      } else {
        setUser(null);
        setUsername("");
        setProfileImage("https://i.imgur.com/itTlcDE.png");
        setIsAdmin(false);
        setBookings([]);
        setBuses([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Fetch buses ---
  async function fetchBuses() {
    setLoading(true);
    const busSnap = await getDocs(collection(db, "bus"));
    const busList = [];
    busSnap.forEach((doc) => {
      busList.push({ id: doc.id, ...doc.data() });
    });
    setBuses(busList);
    setLoading(false);
  }

  // --- Fetch user bookings ---
  async function fetchBookings(uid) {
    const q = query(collection(db, "bookings"), where("userId", "==", uid));
    const bookingSnap = await getDocs(q);
    const bookingsArr = [];
    bookingSnap.forEach((doc) => bookingsArr.push(doc.data()));
    setBookings(bookingsArr);
  }

  // --- Register ---
  async function register() {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        username,
        photo: profileImage,
        admin: false,
      });
      alert("Registered! Please login.");
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  // --- Login ---
  async function login() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  // --- Logout ---
  async function logout() {
    await signOut(auth);
  }

  // --- Pick Image from Gallery ---
  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required!");
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!pickerResult.cancelled) {
      uploadImageToImgur(pickerResult.base64);
    }
  }

  // --- Take Photo ---
  async function takePhoto() {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }
    const cameraResult = await ImagePicker.launchCameraAsync({ base64: true });
    if (!cameraResult.cancelled) {
      uploadImageToImgur(cameraResult.base64);
    }
  }

  // --- Upload Image to Imgur ---
  async function uploadImageToImgur(base64) {
    try {
      setUploading(true);
      const response = await axios.post(
        "https://api.imgur.com/3/image",
        { image: base64, type: "base64" },
        { headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` } }
      );
      setProfileImage(response.data.data.link);
      setUploading(false);
      // Update user photo in firestore
      if (user) {
        await updateDoc(doc(db, "users", user.uid), { photo: response.data.data.link });
      }
    } catch (e) {
      setUploading(false);
      alert("Image upload failed: " + e.message);
    }
  }

  // --- Select Seat ---
  function toggleSeat(seat) {
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seat));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  }

  // --- Book Seats ---
  async function bookSeats() {
    if (!selectedBus) {
      alert("Select a bus first!");
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Select at least one seat!");
      return;
    }
    const bookedSeats = selectedBus.bookedSeats || [];
    // Check for conflicts
    for (const s of selectedSeats) {
      if (bookedSeats.includes(s)) {
        alert(`${i18n.t("seatUnavailable")} ${s}`);
        return;
      }
    }

    // Proceed booking
    try {
      const newBookedSeats = [...(selectedBus.bookedSeats || []), ...selectedSeats];

      // Add booking record
      await setDoc(doc(collection(db, "bookings")), {
        userId: user.uid,
        busId: selectedBus.id,
        seats: selectedSeats,
        busName: selectedBus.busName || selectedBus.name,
        date: selectedBus.date,
        pricePerSeat: selectedBus.price,
        totalPrice: selectedSeats.length * selectedBus.price,
        createdAt: new Date(),
      });

      // Update bus booked seats
      await updateDoc(doc(db, "bus", selectedBus.id), {
        bookedSeats: newBookedSeats,
      });

      alert("Booking successful!");
      setSelectedSeats([]);
      fetchBuses();
      fetchBookings(user.uid);
    } catch (e) {
      alert("Booking failed: " + e.message);
    }
  }

  // --- Admin: Add Bus ---
  const [newBusName, setNewBusName] = useState("");
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newSeatCount, setNewSeatCount] = useState("36"); // default 36 seats
  const [newPrice, setNewPrice] = useState("500");
  const [newBusImage, setNewBusImage] = useState("https://i.imgur.com/itTlcDE.png");
  const [adminUploading, setAdminUploading] = useState(false);

  async function uploadBusImage(base64) {
    try {
      setAdminUploading(true);
      const res = await axios.post(
        "https://api.imgur.com/3/image",
        { image: base64, type: "base64" },
        { headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` } }
      );
      setNewBusImage(res.data.data.link);
      setAdminUploading(false);
    } catch (e) {
      setAdminUploading(false);
      alert("Bus image upload failed: " + e.message);
    }
  }

  async function addBus() {
    if (!newBusName || !newFrom || !newTo || !newDate || !newTime) {
      alert("Fill all bus details");
      return;
    }
    try {
      const seatCountNum = parseInt(newSeatCount);
      if (isNaN(seatCountNum) || seatCountNum <= 0) {
        alert("Seat count must be a positive number");
        return;
      }
      // Generate seat labels like A1-A18, B1-B18, S1-S? based on seatCount
      // Simplified: just numbers 1 to seatCount as seat labels here
      const seats = [];
      for (let i = 1; i <= seatCountNum; i++) seats.push(i.toString());

      await setDoc(doc(collection(db, "bus")), {
        busName: newBusName,
        from: newFrom,
        to: newTo,
        date: newDate,
        time: newTime,
        seats,
        bookedSeats: [],
        price: parseInt(newPrice) || 0,
        image: newBusImage,
        addedBy: user.uid,
      });

      alert("Bus added!");
      setNewBusName("");
      setNewFrom("");
      setNewTo("");
      setNewDate("");
      setNewTime("");
      setNewSeatCount("36");
      setNewPrice("500");
      setNewBusImage("https://i.imgur.com/itTlcDE.png");
      fetchBuses();
    } catch (e) {
      alert("Add bus failed: " + e.message);
    }
  }

  // --- UI Components ---
  if (!user) {
    // Login/Register screen
    return (
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 10 }}>{i18n.t("welcome")}</Text>
        <TextInput
          placeholder={i18n.t("email")}
          value={email}
          onChangeText={setEmail}
          style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        />
        <TextInput
          placeholder={i18n.t("password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        />
        <TextInput
          placeholder={i18n.t("username")}
          value={username}
          onChangeText={setUsername}
          style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
        />
        <Button title={i18n.t("login")} onPress={login} />
        <View style={{ height: 10 }} />
        <Button title={i18n.t("register")} onPress={register} />
      </ScrollView>
    );
  }

  // Logged in UI
  return (
    <ScrollView style={{ flex: 1, padding: 20, backgroundColor: themeDark ? "#222" : "#fff" }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        {i18n.t("welcome")}, {username}
      </Text>

      {/* Profile Section */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        {uploading ? (
          <ActivityIndicator size="large" />
        ) : (
          <Image
            source={{ uri: profileImage }}
            style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 10 }}
          />
        )}
        <Button title={i18n.t("uploadPhoto")} onPress={pickImage} />
        <View style={{ height: 5 }} />
        <Button title={i18n.t("takePhoto")} onPress={takePhoto} />
      </View>

      {/* Update Profile */}
      <TextInput
        placeholder={i18n.t("username")}
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8, color: themeDark ? "#fff" : "#000" }}
      />
      <Button
        title={i18n.t("updateProfile")}
        onPress={async () => {
          try {
            await updateDoc(doc(db, "users", user.uid), { username, photo: profileImage });
            alert("Profile updated!");
          } catch (e) {
            alert("Update failed: " + e.message);
          }
        }}
      />

      <View style={{ marginVertical: 15 }}>
        <Button title={i18n.t("themeToggle")} onPress={toggleTheme} />
        <View style={{ height: 10 }} />
        <Button title={i18n.t("languageToggle")} onPress={toggleLanguage} />
      </View>

      {/* Bus List */}
      <Text style={{ fontSize: 20, marginBottom: 10 }}>{i18n.t("buses")}</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        buses.map((bus) => (
          <TouchableOpacity
            key={bus.id}
            onPress={() => {
              setSelectedBus(bus);
              setSelectedSeats([]);
            }}
            style={{
              marginBottom: 15,
              borderWidth: 1,
              padding: 10,
              borderRadius: 8,
              backgroundColor: themeDark ? "#444" : "#f0f0f0",
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{bus.busName || bus.name}</Text>
            <Text>
              {bus.from} → {bus.to}
            </Text>
            <Text>
              {bus.date} @ {bus.time}
            </Text>
            <Text>
              Price: Rs. {bus.price}
            </Text>
            {bus.image ? (
              <Image
                source={{ uri: bus.image }}
                style={{ height: 120, marginTop: 10, borderRadius: 8 }}
                resizeMode="cover"
              />
            ) : null}
          </TouchableOpacity>
        ))
      )}

      {/* Seat Selection */}
      {selectedBus && (
        <>
          <Text style={{ fontSize: 18, marginBottom: 5 }}>
            {i18n.t("selectSeat")} ({selectedSeats.join(", ") || "None"})
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {(selectedBus.seats || []).map((seat) => {
              const bookedSeats = selectedBus.bookedSeats || [];
              const isBooked = bookedSeats.includes(seat);
              const isSelected = selectedSeats.includes(seat);
              return (
                <TouchableOpacity
                  key={seat}
                  disabled={isBooked}
                  onPress={() => toggleSeat(seat)}
                  style={{
                    width: 40,
                    height: 40,
                    margin: 4,
                    borderRadius: 4,
                    backgroundColor: isBooked
                      ? "#888"
                      : isSelected
                      ? "#4caf50"
                      : themeDark
                      ? "#222"
                      : "#eee",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: isBooked ? "#ddd" : "#000" }}>{seat}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Button title={i18n.t("bookSeat")} onPress={bookSeats} />
        </>
      )}

      {/* Booking History */}
      <Text style={{ fontSize: 20, marginVertical: 15 }}>{i18n.t("bookingHistory")}</Text>
      {bookings.length === 0 && <Text>No bookings yet.</Text>}
      {bookings.map((booking, i) => (
        <View
          key={i}
          style={{
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
            borderRadius: 6,
            backgroundColor: themeDark ? "#333" : "#fafafa",
          }}
        >
          <Text>Bus: {booking.busName}</Text>
          <Text>Date: {booking.date}</Text>
          <Text>Seats: {booking.seats.join(", ")}</Text>
          <Text>Total: Rs. {booking.totalPrice}</Text>
        </View>
      ))}

      {/* Admin Panel */}
      {isAdmin && (
        <>
          <Text style={{ fontSize: 20, marginVertical: 10 }}>{i18n.t("adminPanel")}</Text>
          <TextInput
            placeholder={i18n.t("busName")}
            value={newBusName}
            onChangeText={setNewBusName}
            style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
          />
          <TextInput
            placeholder={i18n.t("from")}
            value={newFrom}
            onChangeText={setNewFrom}
            style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
          />
          <TextInput
            placeholder={i18n.t("to")}
            value={newTo}
            onChangeText={setNewTo}
            style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
          />
          <TextInput
            placeholder={i18n.t("date")}
            value={newDate}
            onChangeText={setNewDate}
            style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
          />
          <TextInput
            placeholder={i18n.t("time")}
            value={newTime}
            onChangeText={setNewTime}
            style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
          />
          <TextInput
            placeholder={i18n.t("seatCount")}
            value={newSeatCount}
            keyboardType="numeric"
            onChangeText={setNewSeatCount}
            style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
          />
          <TextInput
            placeholder={i18n.t("price")}
            value={newPrice}
            keyboardType="numeric"
            onChangeText={setNewPrice}
            style={{ borderWidth: 1, marginBottom: 5, padding: 8 }}
          />

          {/* Bus image upload */}
          <View style={{ marginVertical: 10, alignItems: "center" }}>
            {adminUploading ? (
              <ActivityIndicator size="large" />
            ) : (
              <Image
                source={{ uri: newBusImage }}
                style={{ width: 150, height: 100, borderRadius: 8 }}
                resizeMode="cover"
              />
            )}
            <Button
              title={i18n.t("uploadPhoto")}
              onPress={async () => {
                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!permission.granted) {
                  alert("Permission required");
                  return;
                }
                const pickerResult = await ImagePicker.launchImageLibraryAsync({ base64: true });
                if (!pickerResult.cancelled) {
                  uploadBusImage(pickerResult.base64);
                }
              }}
            />
            <Button
              title={i18n.t("takePhoto")}
              onPress={async () => {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                  alert("Permission required");
                  return;
                }
                const cameraResult = await ImagePicker.launchCameraAsync({ base64: true });
                if (!cameraResult.cancelled) {
                  uploadBusImage(cameraResult.base64);
                }
              }}
            />
          </View>

          <Button title={i18n.t("submit")} onPress={addBus} />
        </>
      )}

      <View style={{ marginTop: 30 }}>
        <Button title={i18n.t("logout")} onPress={logout} />
      </View>
    </ScrollView>
  );
}
