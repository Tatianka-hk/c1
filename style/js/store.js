const firebaseConfig = {
  apiKey: "AIzaSyDfDZUOgJSS1iaNR57tbK5GDywz1xwwWRs",
  authDomain: "control-93906.firebaseapp.com",
  projectId: "control-93906",
  storageBucket: "control-93906.appspot.com",
  messagingSenderId: "672018658120",
  appId: "1:672018658120:web:a39574e6ffbbc283eaf97d",
  measurementId: "G-LXYZ88SP6W",
}

const app = firebase.initializeApp(firebaseConfig)
const db = firebase.firestore(app)

function generateToken(length = 32) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let token = ""
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return token
}

async function getData() {
  const ticket = localStorage.getItem("ticket")

  if (!ticket) return false

  const usersRef = db.collection("users").where("ticket", "==", Number(ticket))
  const querySnapshot = await usersRef.get()
  return querySnapshot.docs[0].data()
}

async function verifyToken() {
  const token = localStorage.getItem("authToken")
  if (!token) return false

  const tokenRef = db.collection("tokens").where("token", "==", token)
  const querySnapshot = await tokenRef.get()

  return !querySnapshot.empty
}

async function loginBD(ticket, surname) {
  try {
    const usersRef = db.collection("users")
    const q = usersRef
      .where("surname", "==", surname)
      .where("ticket", "==", Number(ticket))
    const querySnapshot = await q.get()
    console.log("Query Snapshot:", querySnapshot)
    if (querySnapshot.empty) {
      console.error("User not found with the provided ticket and surname")
      return false
    }

    const userDoc = querySnapshot.docs[0]
    const token = generateToken()
    localStorage.setItem("authToken", token)
    localStorage.setItem("ticket", ticket)
    await db
      .collection("tokens")
      .doc(userDoc.id)
      .set({ token, createdAt: new Date() })
    return true
  } catch (error) {
    console.error("Error during login:", error)
    return false
  }
}
async function login_user(event) {
  try {
    event.preventDefault()
    console.log("login_user")

    const ticketInput = document.getElementById("ticket-input").value
    const surnameInput = document.getElementById("surname-input").value
    console.log(ticketInput, surnameInput)

    const success = await loginBD(ticketInput, surnameInput)
    console.log(success)
    if (success) {
      window.location.href = "home.html"
    } else {
      document.getElementById("error_login").style.display = "block"
    }
  } catch (error) {
    console.error("Login failed:", error)
    document.getElementById("error_login").style.display = "block"
  }
}

async function getUsersForRecommendation() {
  const ticket = localStorage.getItem("ticket")

  if (!ticket) return false

  const currentUserRef = db.collection("users").where("ticket", "==", Number(ticket))
  const querySnapshot = await currentUserRef.get()
  const currentUserData = querySnapshot.docs[0].data()

  const users = []
  const usersRef = db.collection("users")
  const querySnapshot1 = await usersRef.get()
  const usersData = querySnapshot1.docs
  usersData.forEach((userData) => {
    users.push(userData.data())
  })
  console.log(users)
  const contentBasedRecs = findRecommendations(currentUserData, users);

  const collabRecs = await getCollaborativeRecommendations(currentUserData, users);

  const combinedRecs = mergeRecommendations(contentBasedRecs, collabRecs);
  console.log(collabRecs, contentBasedRecs)
  console.log(combinedRecs)
  return combinedRecs.slice(0, 5);
}
async function getCollaborativeRecommendations(currentUserData, usersData) {
  const currentUserInteractions = currentUserData.interactions || {};

  const otherUsers = usersData.filter(user => user.id !== currentUserData.id);

  const recommendations = otherUsers.map(user => {
    const similarityScore = Object.keys(user.interactions || {}).reduce((acc, key) => {
      if (currentUserInteractions[key]) {
        acc += Math.min(user.interactions[key], currentUserInteractions[key]);
      }
      return acc;
    }, 0);
    return { ...user, similarityScore };
  });

  return recommendations.sort((a, b) => b.similarityScore - a.similarityScore);
}

function mergeRecommendations(contentRecs, collabRecs) {
  const merged = [...contentRecs, ...collabRecs];
  const uniqueRecs = [];

  const uniqueIds = new Set();

  merged.forEach(rec => {
    if (!uniqueIds.has(rec.id)) {
      uniqueIds.add(rec.id);
      uniqueRecs.push(rec);
    }
  });

  return uniqueRecs.sort((a, b) => b.matchScore - a.matchScore);
}

function findRecommendations(currentUser, users) {
  console.log(users)
  return users
    .filter((user) => user.name !== currentUser.name)
    .map((user) => {
      const sharedTopics = user.themes.filter((theme) =>
        currentUser.themes.includes(theme),
      )
      const allTopics = new Set([...currentUser.themes, ...user.themes])
      const jaccardIndex = sharedTopics.length / allTopics.size
      return {
        name: user.name,
        last: user.last,
        surname: user.surname,
        themes: user.themes,
        sharedTopics: sharedTopics,
        matchScore: jaccardIndex,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5)
}
