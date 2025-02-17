export const validateFirstName = (firstName) => {
  const ExpFullName = /^[a-zA-Z ]{1,20}$/;
  return ExpFullName.test(firstName);
};

export const validateLastName = (lastName) => {
  const ExpFullName = /^[a-zA-Z ]{1,20}$/;
  return ExpFullName.test(lastName);
};


export const validateDateOfBirth = (dateOfBirth) => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age >= 16;
};

export const validateNickname = (nickname) => {
  if (!nickname) return true
  const ExpNickname = /^[a-zA-Z]{1,20}$/;
  return ExpNickname.test(nickname);
};


export const validateAboutMe = (aboutMe) => {
  if (!aboutMe) return true;
  return aboutMe.trim().length <= 150;
};


export const validateEmail = (email) => {
  const ExpEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const cleanEmail = email.trim();
  return cleanEmail.length >= 5 && cleanEmail.length <= 50 && ExpEmail.test(cleanEmail);
};

export const validatePassword = (password) => {
  const ExpPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}|:"<>?~`]).{8,}$/;
  return ExpPassword.test(password);
};


export const validatePasswordConfirmation = (password, passwordConfirmation) => {
  return password === passwordConfirmation;
};