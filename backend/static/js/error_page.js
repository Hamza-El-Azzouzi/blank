export function errorPage(errCode = 404) {
  var errorMap = {
    "1": ["Oops! JavaScript not found", "JavaScript is disabled in your browser. Please enable it for the best experience."],
    "400": ["Bad Request", "The server could not understand the request due to invalid syntax. Please check your input and try again."],
    "403": ["Forbidden", "You do not have permission to access this resource."],
    "404": ["Oops! Page not found", "The page you're looking for doesn't exist or has been moved."],
    "405": ["Method Not Allowed", "The request method is not supported for the requested resource."],
    "429": ["Too Many Requests", "You have sent too many requests in a given amount of time. Please try again later."],
    "500": ["Something Went Wrong!", "Oops! It looks like our server encountered an unexpected issue. Don't worry, our team has been notified."],

  }
  const app = document.getElementById("main-content");
  app.innerHTML = ""
  applyStyles()
  const errorContainer = document.createElement('div');
  errorContainer.classList.add('error-container');

  const errorContent = document.createElement('div');
  errorContent.classList.add('error-content');

  const errorAnimation = document.createElement('div');
  errorAnimation.classList.add('error-animation');

  const errorIcon = document.createElement('div');
  errorIcon.classList.add('error-icon');
  errorIcon.textContent = '😕';

  const errorShadow = document.createElement('div');
  errorShadow.classList.add('error-shadow');

  errorAnimation.appendChild(errorIcon);
  errorAnimation.appendChild(errorShadow);

  const heading = document.createElement('h1');
  heading.textContent = `${errCode} - ${errorMap[errCode][0]}`;

  const paragraph = document.createElement('p');
  paragraph.textContent = `${errorMap[errCode][1]}`;
  const homeButton = document.createElement('a');
  homeButton.href = "/"
  homeButton.classList.add('home-button');
  homeButton.textContent = 'Go Back';
  homeButton.setAttribute('data-page', 'feed');

  errorContent.appendChild(errorAnimation);
  errorContent.appendChild(heading);
  errorContent.appendChild(paragraph);
  errorContent.appendChild(homeButton);
  errorContainer.appendChild(errorContent);
  app.appendChild(errorContainer)

}

function applyStyles() {
  var link = document.querySelector('link[rel="stylesheet"]');
  link.href = '/static/css/error.css';
}
