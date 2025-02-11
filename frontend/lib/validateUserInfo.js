export const validateForm = (formData) => {
    // Validate First Name
    const ExpFullName = /^[a-zA-Z]{1,20}$/;
    if (!ExpFullName.test(formData.firstName)) {
      return {
        isValid: false,
        message: "First name can only contain characters, and cannot exceed 20 characters"
      };
    }
  
    // Validate Last Name
    if (!ExpFullName.test(formData.lastName)) {
      return {
        isValid: false,
        message: "Last name can only contain characters, and cannot exceed 20 characters"
      };
    }
  
    // Validate Date of Birth
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 15) {
      toast.error('You must be at least 15 years old to register');
      return false;
    }
  
    // Validate Nickname (optional)
    const ExpNickname = /^[a-zA-Z]{1,20}$/;
    if (formData.nickname && !ExpNickname.test(formData.nickname)) {
      return {
        isValid: false,
        message: "Nickname can only contain characters, and cannot exceed 20 characters"
      };
    }
  
    // Validate About Me (optional)
    if (formData.aboutMe) {
      const cleanAboutMe = formData.aboutMe.trim();
      if (cleanAboutMe.length > 150) {
        return {
          isValid: false,
          message: "About me section cannot exceed 150 characters"
        };
      }
    }
  
    // Validate Email
    const ExpEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const cleanEmail = formData.email.trim();
    if (cleanEmail.length < 5 || cleanEmail.length > 50) {
      return {
        isValid: false,
        message: "Email must be between 5 and 50 characters long"
      };
    }
  
    if (!ExpEmail.test(cleanEmail)) {
      return {
        isValid: false,
        message: "Invalid email format"
      };
    }
    return {
      isValid: true,
      message: ""
    };
  };