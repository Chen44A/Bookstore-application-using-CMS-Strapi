//render inlogged username
let username = JSON.parse(sessionStorage.getItem('user')).username;
document.querySelector('#displayUsername').innerHTML = username;
        


//sign out funktion
const signOut = () => {
    sessionStorage.clear();
    // window.location.href = "index.html";
}
document.querySelector('#signOutBtn').addEventListener('click',signOut)





/* ---------- Function for sort and render user-profile i dom ---------- */

const favoriteSortSelect = document.querySelector('#favorite_sort');
const reviewSortSelect = document.querySelector('#review_sort');

// eventlistener for sort select
favoriteSortSelect.addEventListener('change',async ()=> {
    let sortOption = favoriteSortSelect.value;

    await renderReadList(sortOption);
});

reviewSortSelect.addEventListener('change',async ()=> {
    let sortOption = reviewSortSelect.value;

    await renderReviews(sortOption);
});


//*---------- render read list ----------*
const list_container = document.querySelector('#list_container');

const renderReadList = async (sortOption) => {
    let response = await axios.get('http://localhost:1337/api/users/me?populate=deep,3',{
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
    });

    let ReadList = response.data.favorite_books
    // console.log(ReadList);
  
    //sort read-list 
    if (sortOption === 'author') {
        ReadList.sort((a, b) => {
            if (a.author > b.author) {
                return 1; // 如果a的作者名字在字母表中排在b的后面，则返回1，表示a在b之后
            } else {
                return -1; // 如果a的作者名字在字母表中排在b的前面，则返回-1，表示a在b之前
            }
        });
    } else if (sortOption === 'title') {
        ReadList.sort((a, b) => {
            if (a.title > b.title) {
                return 1; // 如果a的书名在字母表中排在b的后面，则返回1，表示a在b之后
            } else {
                return -1; // 如果a的书名在字母表中排在b的前面，则返回-1，表示a在b之前
            }
        });
    }

    //clear container content
    list_container.innerHTML = '';

    ReadList.forEach((book) => {
        list_container.innerHTML += `<div class='favorite_book_info'>
            <div class='favorite_img_container'>
                <img src=http://localhost:1337${book.image.url} class='favorite_book_img'>
            </div>
            <div class='favorite_book_wrapper'>
                <h4 class='favorite_book_title'>${book.title}</h4>
                <p class='favorite_author'>by ${book.author}</p>
                <p class='favorite_book_detail'>${book.pages} pages, ${book.published} </p>
            </div>
            <button class='favorite_Btn' book-id='${book.id}'><i class="fa-solid fa-heart"></i></button>
        </div>`
    });

    
    let favoriteBtns = document.querySelectorAll('.favorite_Btn');
    favoriteBtns.forEach(button => {
        button.addEventListener('click',async () => {
                let bookId = button.getAttribute('book-id');
                console.log(bookId);
    
                let userId = JSON.parse(sessionStorage.getItem('user')).id 
                await axios.put(`http://localhost:1337/api/books/${bookId}`,
                            {
                                data: {
                                    favorite_by: {
                                        disconnect: [userId]
                                    }
                                }
                            },
                            {
                                headers: {
                                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                                },
                            });
                location.reload()
        })
    })
}

//*---------- render reviewed books ----------*
const review_container = document.querySelector('#review_container');
const renderReviews = async (sortOption) => {
    let response = await axios.get('http://localhost:1337/api/users/me?populate=deep,3',{
        headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
    });

    let bookReviews = response.data.reviews;
    console.log(bookReviews);

    //sort reveiws
    if (sortOption === 'author') {
        bookReviews.sort((a, b) => {
            if (a.book.author > b.book.author) {
                return 1; 
            } else {
                return -1; 
            }
        });
    } else if (sortOption === 'title') {
        bookReviews.sort((a, b) => {
            if (a.book.title > b.book.title) {
                return 1; 
            } else {
                return -1; 
            }
        });
    } else if (sortOption === 'point') {
        bookReviews.sort((a, b) => b.rating - a.rating);
    }

    // clear container content
    review_container.innerHTML = '';

    bookReviews.forEach(review => {
        review_container.innerHTML += ` <div class='favorite_book_info'>
        <div class='favorite_book_wrapper'>
            <h4 class='favorite_book_title'>${review.book.title}</h4>
            <p class='favorite_author'>by ${review.book.author}</p>
            <p class='favorite_book_detail'>${review.book.pages} pages, ${review.book.published} </p>
        </div>
        <div>
            <p><span class='rating'>${review.rating}</span> Point</p>
        </div>
    </div>  `
    })
}

//*---------- toggle readlist and review div ----------*
const readListDiv = document.querySelector('.readList_div')
const reviewDiv = document.querySelector('.review_div')
const readListBtn = document.querySelector('#readListBtn');
const reviweBtn = document.querySelector('#reviweBtn');

//change to readlist div
readListBtn.addEventListener('click',() => {
    readListDiv.style.display = 'block'
    reviewDiv.style.display = 'none';
    readListBtn.style.fontWeight = '800';
    reviweBtn.style.fontWeight = '400';

});

//change to review div
reviweBtn.addEventListener('click',() => {
    reviewDiv.style.display = 'block'
    readListDiv.style.display = 'none';
    reviweBtn.style.fontWeight = '800';
    readListBtn.style.fontWeight = '400';
});


renderReadList();
renderReviews();
