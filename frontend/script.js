//overlay interation variables
const loginBtn = document.querySelector('#loginBtn');
const overlay = document.querySelector('.overlay')
const overlay_mask = document.querySelector('.overlay-mask');
const review_overlay = document.querySelector('.review_overlay');
const review_submitBtn = document.querySelector('#review_submitBtn');

//other variables
const login = document.querySelector('#login');
const newAccount= document.querySelector('#newAccount');

const usernameInput = document.querySelector('#usernameInput');
const passwordInput = document.querySelector('#passwordInput');
const usernameCreate = document.querySelector('#usernameCreate');
const emailCreate = document.querySelector('#emailCreate');
const passwordCreate = document.querySelector('#passwordCreate');

const registerBtn = document.querySelector('#registerBtn');
const signinBtn = document.querySelector('#signinBtn');

const logInputDiv = document.querySelector('.inlog_container');
const registerInputDiv = document.querySelector('.register_container')

const userAccount = document.querySelector('#userAccount');
const signOutBtn = document.querySelector('#signOutBtn');

/* ---------- Function to login and register ---------- */
//open inlog overlay
loginBtn.addEventListener('click',()=> {
    overlay_mask.style.display = 'block'
    overlay.style.display = 'block'
})

//change to create account overlay
newAccount.addEventListener('click', ()=>{
    login.style.background = "#E6E2E2";
    newAccount.style.background = 'white';
    registerInputDiv.style.display='block';
    logInputDiv.style.display='none'
})

//change to login overlay
login.addEventListener('click', ()=>{
    login.style.background = "white";
    newAccount.style.background = '#E6E2E2';
    logInputDiv.style.display='block'
    registerInputDiv.style.display='none';
})

//close inlog overlay
const closeInlogOverlay = () => {
    overlay_mask.style.display = 'none'
    overlay.style.display = 'none'
}

//close review overlay
const closeReviewOverlay = () => {
    overlay_mask.style.display = 'none'
    review_overlay.style.display = 'none'
}


//user login funktion
const logIn = async () => {
    let response = await axios.post('http://localhost:1337/api/auth/local',{
        identifier:usernameInput.value,
        password:passwordInput.value
    });
    // console.log(response.data.user);
    sessionStorage.setItem('token',response.data.jwt);
    sessionStorage.setItem('user',JSON.stringify(response.data.user));
    renderUserHomePage();
}

//user register funktion
const createAccount = async () => {
    try {
    let response= await axios.post('http://localhost:1337/api/auth/local/register',{
        //request body
        username: usernameCreate.value,
        email:emailCreate.value,
        password:passwordCreate.value,
    })
        alert('Your registration is complete! Please log in!')
    console.log(response.data);
    } catch {
        alert('Username or Email address is already taken!')
    }

    // clear input value
    usernameCreate.value = '';
    emailCreate.value = '';
    passwordCreate.value ='';
}

//check if user logged in
let checkIfLoggedIn = async () =>{
    let status;
    try {
        await axios.get('http://localhost:1337/api/users/me',{
            headers: {
                Authorization : `Bearer ${sessionStorage.getItem('token')}` 
            },
        });
       status = true;
    } catch (error) {
        console.log(error);
        status = false;
    } finally { 
        return status;
    }
}


// render after user loggin (header change)
const renderUserHomePage = async () => {
    let isLoggedIn =  await checkIfLoggedIn();
    console.log('isLoggedIn: ',isLoggedIn);
    
    if (isLoggedIn){
         //render inlogged username
        let username = JSON.parse(sessionStorage.getItem('user')).username;
        document.querySelector('#displayUsername').innerHTML = username;
        
        document.querySelector('.inlogged').style.display = 'block'
        document.querySelector('.utlogged').style.display = 'none'
        closeInlogOverlay();
    } else {
        document.querySelector('.inlogged').style.display = 'none'
        document.querySelector('.utlogged').style.display = 'block'
    }
}   

//sign out funktion
const signOut = () => {
    sessionStorage.clear();
    renderUserHomePage();
}



/* ---------- Function to render books i dom ---------- */
const bookContainer = document.querySelector('#book_container');

const getBooks = async () => {
    let response = await axios.get('http://localhost:1337/api/books?populate=*');
    let books = response.data.data
    // console.log(books);

   
    books.forEach((book) => {
        // *----calculate average value function----*
        let totalPoint = 0;
        // check if there is some user rated
        if (book.attributes.reviews.data.length > 0) {
            // calculate total point for every book
            book.attributes.reviews.data.forEach(point => {
                totalPoint += point.attributes.rating;
            })
        }
        // calculate average point for every book, if there's no user rated, then the point is 0
        let averageRating = book.attributes.reviews.data.length > 0 ? totalPoint / book.attributes.reviews.data.length : 0;
        // round the average point
        averageRating = Math.round(averageRating);
        
        //render every book i dom
        bookContainer.innerHTML += `<div class='book_info'>
            <div class='img_container'>
                <img src=http://localhost:1337${book.attributes.image.data?.attributes.url} class='book_img'>
            </div>
            <div class='point'><i class="fa-solid fa-star"></i><span id ='averageRating'>${averageRating}/10</span> Point</div>
            <div class='book_wrapper'>
                <div>
                    <h4>${book.attributes.title}</h4>
                    <p class='author'>by ${book.attributes.author}</p>
                    <p class='book_detail'>${book.attributes.pages} pages, ${book.attributes.published} </p>
                </div>
                <button class='favoriteBtn' book-id='${book.id}'> <i class="fa-regular fa-heart"></i></button>
            </div>
            <button class='rateBtn' book-id='${book.id}' book-title='${book.attributes.title}'> RATE BOOK </button>
        </div>`
    });

    
    //funktion for add book to read list
    let favoriteBtns = document.querySelectorAll('.favoriteBtn');
    favoriteBtns.forEach(button => {
        button.addEventListener('click',async () => {
           
            //check if user logged in
            let isLoggedIn =  await checkIfLoggedIn();
            if (isLoggedIn === false) {
                alert ('Please log in or register an account first!')
            } else {

                //change icon when user klick
                let icon = button.querySelector('i.fa-regular.fa-heart');
                if (icon) {
                    icon.classList.remove('fa-regular', 'fa-heart');
                    icon.classList.add('fas', 'fa-heart');
                } 
                
                let bookId = button.getAttribute('book-id');
                console.log(bookId);

                let userId = JSON.parse(sessionStorage.getItem('user')).id 
                await axios.put(`http://localhost:1337/api/books/${bookId}`,
                            {
                                data: {
                                    favorite_by: {
                                        connect: [userId]
                                    }
                                }
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                                },
                            });
            }
        })
    })

    //funktion for rate book
    let rateBtns = document.querySelectorAll('.rateBtn');
    rateBtns.forEach(button => {
        button.addEventListener('click',async ()=> {
            //check if user logged in
            let isLoggedIn =  await checkIfLoggedIn();
            if (isLoggedIn === false) {
                alert ('Please log in or register an account first!')
            } else {
                //check if user already rated this book before.
                let response = await axios.get('http://localhost:1337/api/users/me?populate=deep,3',{
                                    headers: {
                                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                                    }
                                });   
                const allReviewedBooks = response.data.reviews;
                const allReviewedBookTitle = allReviewedBooks.map(book => book.book.title);
                console.log(allReviewedBookTitle);

                let bookTitle = button.getAttribute('book-title');
                let bookId = button.getAttribute('book-id');
                let userId = JSON.parse(sessionStorage.getItem('user')).id 

                if (allReviewedBookTitle.includes(bookTitle)){
                    alert ('You already rated this book!')
                } else {
                    //open rate overlay
                    overlay_mask.style.display = 'block'
                    review_overlay.style.display = 'block'

                    //display overlay title
                    document.querySelector('#bookTitle').innerHTML = bookTitle;

                    //submit rate to strapi
                    const radioBtns = document.querySelectorAll('input[type="radio"]');
                    radioBtns.forEach(radioBtn => {
                        radioBtn.addEventListener('change',() => {
                            if (radioBtn.checked) {
                                review_submitBtn.addEventListener('click',async ()=> {
                                    await axios.post(`http://localhost:1337/api/reviews`,
                                    {
                                        data: {
                                            rating: radioBtn.value,
                                            book: {
                                                connect: [bookId]
                                            },
                                            user: {
                                                connect: [userId]
                                            },
                                        }
                                    },
                                    {
                                        headers: {
                                            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                                        },
                                    });
                                    closeReviewOverlay();
                                    location.reload();
                                })
                    
                            }            
                        });
                    });
                }  
                    
              
                
            };
        });
    });

}

signinBtn.addEventListener('click',logIn);
registerBtn.addEventListener('click',createAccount);
signOutBtn.addEventListener('click',signOut);

getBooks();
renderUserHomePage();
