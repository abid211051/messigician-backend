const cookieOptions = (age) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: age,
  };
};

const cookieParser = (cookies) => {
  const map = new Map();
  cookies &&
    cookies.split(";").forEach((val) => {
      const [key, value] = val.trim().split("=");
      map.set(key, value);
    });
  return map;
};

export { cookieOptions, cookieParser };
