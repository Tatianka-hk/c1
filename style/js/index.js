function back() {
  window.location.href = "home.html"
}

function button_on_click() {
  console.log("aqui")
  if (document.getElementById("buttonmenu").style.display == "block") {
    document.getElementById("buttonmenu").style.display = "none"
    document.getElementById("nav_vertical").style.display = "block"
  } else {
    document.getElementById("buttonmenu").style.display = "block"
    document.getElementById("nav_vertical").style.display = "none"
  }
}
function logout() {
  localStorage.removeItem("authToken")
  localStorage.removeItem("ticket")
  window.location.href = "index.html"
}

function loadHTML() {
  document.getElementById("id_nav_vertical").innerHTML = navHTML
  document.getElementById("id_nav_horizontal").innerHTML = navHTML
  document.getElementById("id_footer").innerHTML = footerHtmlText()
}

function updateCSSVariables(primaryColor, secondaryColor, accentColor) {
  document.documentElement.style.setProperty("--primary-color", primaryColor)
  document.documentElement.style.setProperty("--secondary-color", secondaryColor)
  document.documentElement.style.setProperty("--accent-color", accentColor)
}

function auth_use_nav() {
  if (
    localStorage.getItem("authToken") != undefined &&
    localStorage.getItem("authToken") != null
  ) {
    console.log("si")
    const authNavElements = document.querySelectorAll(".auth_nav")
    authNavElements.forEach((el) => {
      el.style.display = "block"
    })
  } else {
    console.log("no")
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadHTML()
  auth_use_nav()
  updateCSSVariables(colors.primaryColor, colors.secondColor, colors.accentColor)
})

const membersFilterInput = document.querySelector(".members-filter-input")
const memberContainers = document.querySelectorAll(".member-container")
membersFilterInput.addEventListener("input", filterMembers)

function filterMembers() {
  const filterText = membersFilterInput.value.toLowerCase()

  memberContainers.forEach((container) => {
    const pib = container.querySelector(".member-PIB").textContent.toLowerCase()
    const description = container
      .querySelector(".member-Description")
      .textContent.toLowerCase()

    if (pib.includes(filterText) || description.includes(filterText)) {
      container.style.display = "flex"
    } else {
      container.style.display = "none"
    }
  })
}
