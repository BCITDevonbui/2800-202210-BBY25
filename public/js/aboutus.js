document.getElementById("home").addEventListener("click", () => {
  window.location.assign("/");
})

document.getElementById("about").addEventListener("click", () => {

  window.location.replace("/about");
})

document.getElementById("contact").addEventListener("click", () => {
  window.location.replace("/contactus");
})