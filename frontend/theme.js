const getTheme = async () => {
   const response = await axios.get('http://localhost:1337/api/theme');
   const mode = response.data.data.attributes.mode;
   // console.log(mode);

   if (mode === 'dark_mode') {
      document.body.classList.toggle('darkmode');
   } else if (mode === 'light_mode') {
      document.body.classList.toggle('lightmode');
   } else if (mode === 'purple') {
      document.body.classList.toggle('violet');
   }
}

getTheme();