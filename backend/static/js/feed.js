import { NavigateTo } from "./app.js";
import { errorPage } from "./error_page.js";
let isLoading = false;
let stopLoading = false;
let loggeed
let connectionToWS;
let totalposts = 0;
let observator = 0
let typingTimer;


export function feedPage() {
    const navBar = document.querySelector("#app > header")
    navBar.style.display = "block";
    initializeWebSocket();
    getPosts(0);
    applyStyles();
    const app = initializeAppContainer();
    const flexContainer = createFlexContainer(app);
    const feedContainer = createFeedContainer(flexContainer);
    const postForm = createPostForm();
    getCategories();
    const postsFeed = createPostsFeed();
    feedContainer.appendChild(postForm);
    feedContainer.appendChild(postsFeed);
    createUserSection(flexContainer);
    fetchUsers(0, true);
    setupFormInteractions(postForm);
}

function initializeWebSocket() {
    connectionToWS = new WebSocket("ws://127.0.0.1:1414/ws");
    connectionToWS.addEventListener("open", () => {
        connectionToWS.send(JSON.stringify({ Ask: "Who Are You" }))
    });


    connectionToWS.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.hasOwnProperty("username")) {
            loggeed = data["username"]
        }
        if (data.hasOwnProperty("type")) {
            updateUserStatus(data.userID, data.online);
        }
        if (data.hasOwnProperty("msg")) {
            const popup = document.querySelector(`.message-popup[data-user-name="${data["senderUserName"]}"]`);
            if (popup) {
                const messageHistory = popup.querySelector('.message-history');

                if (Math.abs(messageHistory.scrollHeight - messageHistory.clientHeight - messageHistory.scrollTop) <= 1) {
                    addMessage(data["senderUserName"], loggeed, data["msg"], false, true, true, popup, data["date"]);
                } else {
                    addMessage(loggeed, data["senderUserName"], data["msg"], false, true, false, popup, data["date"]);
                }
            } else {
                fetchUsers(0, false);
                newMeessage(data["session"]);
            }
        }
        if (data["pimp"] === "Typing In Progress") {
            const popup = document.querySelector(`.message-popup[data-user-name="${data["usernametyper"]}"]`);
            if (popup) {
                const messageHistory = popup.querySelector('.message-history');
                if (Math.abs(messageHistory.scrollHeight - messageHistory.clientHeight - messageHistory.scrollTop) <= 1) {
                    typingInProgress(popup, data["usernametyper"], true)
                } else {
                    typingInProgress(popup, data["usernametyper"], false)
                }
            } else {
                const usernameElement = Array.from(document.querySelectorAll('.username')).find(el => el.textContent.trim() === data["usernametyper"]);
                const isTyping = document.createElement('span');
                isTyping.textContent = " Is typing ..."
                if (usernameElement.childNodes.length === 2) {
                    usernameElement.insertBefore(isTyping, usernameElement.lastChild);
                } else {
                    usernameElement.appendChild(isTyping);
                }
            }
        } else if (data["pimp"] === "Typing Stoped") {
            const popup = document.querySelector(`.message-popup[data-user-name="${data["usernametyper"]}"]`);
            if (popup) {
                typingStopped(data["usernametyper"])
            } else {
                const usernameElement = Array.from(document.querySelectorAll('.username')).find(el => el.textContent.trim() === data["usernametyper"] + " Is typing ...");
                if (usernameElement) {
                    usernameElement.childNodes.forEach((child) => {
                        if (child.textContent === " Is typing ...") {
                            child.remove();
                        }
                    })
                }
            }


        }
        if (data.hasOwnProperty("user")) {
            setTimeout(() => {
                fetchUsers(0, false);
            }, 1000);
        }
    };


    connectionToWS.onerror = (error) => {
        NavigateTo("error")
        console.error("WebSocket error:", error);
    };

}

function newMeessage(receiverID) {
    const usernameElement = document.querySelector(`.username[data-user-id="${receiverID}"]`);
    const img = document.createElement("img");
    img.src = "static/image/svgviewer-output.svg";
    img.alt = "Notification Icon";
    img.className = "notify-msg"
    usernameElement.appendChild(img);
}

function CheckUnreadMessage() {
    let sessionId = getCookieByName("sessionId")
    fetch("/api/checkUnreadMesg", {
        method: "POST",
        body: JSON.stringify({ session: sessionId })
    }).then(response => {
        if (!response.ok) {
            errorPage(response.status)
            return
        }
        return response.json()
    })
        .then(unReadMsgs => {
            unReadMsgs.forEach(userID => {
                newMeessage(userID)
            })
        })
}

function applyStyles() {
    var link = document.querySelector('link[rel="stylesheet"]');
    link.href = '/static/css/feed.css';
}

function initializeAppContainer() {
    const app = document.getElementById("main-content");
    return app;
}

function createFlexContainer(app) {
    const flexContainer = document.createElement('div');
    flexContainer.className = 'flex-container';
    app.appendChild(flexContainer);
    return flexContainer;
}

function createFeedContainer(flexContainer) {
    const feedContainer = document.createElement('div');
    feedContainer.className = 'feed-container';
    flexContainer.appendChild(feedContainer);
    return feedContainer;
}

function createPostForm() {
    const postForm = document.createElement('div');
    postForm.className = "form-container";
    postForm.tabIndex = "0";
    const postFormContent = `
        <div class="form-header" id="formHeader">
            <input type="text" placeholder="Title" name="title" class="form-input">
            <p class="err" id="title-error"></p>
        </div>
        <form id="postForm" class="collapsed" method="post">
            <div class="form-group">
                <textarea id="postContent" name="content" placeholder="Enter text here..."></textarea>
                <p class="err" id="textarea-error"></p>
            </div>
            <div class="form-group" id="category-list">
                <fieldset></fieldset>
                <p class="err" id="category-error"></p>
            </div>
            <button type="submit" class="post-button">Post</button>
        </form>
    `;
    postForm.innerHTML = postFormContent;
    return postForm;
}

function createPostsFeed() {
    const postsFeed = document.createElement('div');
    postsFeed.className = "feed";
    return postsFeed;
}

function createUserSection(flexContainer) {
    const userSection = document.createElement('div');
    userSection.className = 'user-section';
    userSection.innerHTML = `
        <h2>Registered Users</h2>
        <input
            type="text"
            id="searchInput"
            class="search-input"
            placeholder="Search users..."
        />
        <div class="user-list">
        </div>
    `;
    flexContainer.appendChild(userSection);
}

function setupFormInteractions() {
    const formContainer = document.querySelector('.form-container');
    const formInput = document.querySelector('.form-input');
    const postFormElement = document.getElementById('postForm');
    const userList = document.querySelector(".user-list");
    const searchInput = document.getElementById('searchInput');

    formInput.addEventListener('focus', () => {
        formContainer.classList.add('expanded');
        postFormElement.classList.add('active');
    });

    formContainer.addEventListener('focusout', (event) => {
        setTimeout(() => {
            if (!formContainer.contains(event.relatedTarget)) {
                formContainer.classList.remove('expanded');
                postFormElement.classList.remove('active');
            }
        }, 100);
    });

    postFormElement.addEventListener("submit", (event) => {
        event.preventDefault();
        handleFormSubmission(formContainer, postFormElement);
    });

    userList.addEventListener("scroll", debounce(() => {
        if (userList.scrollTop + userList.clientHeight >= userList.scrollHeight - 10) {
            const users = document.querySelectorAll(".username");
            fetchUsers(users.length, true)
        }
    }), 300);

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm.length === 0) {
            fetchUsers(0, false)
        } else {
            getUsers(searchTerm);

        }
    });
}

function handleFormSubmission(formContainer, postFormElement) {
    let isValid = true;

    document.getElementById('title-error').textContent = '';
    document.getElementById('category-error').textContent = '';
    document.getElementById('textarea-error').textContent = '';

    const title = document.querySelector('.form-input').value;
    const content = document.getElementById('postContent').value;
    const checkboxes = document.querySelectorAll('#category-list input[type="checkbox"]');
    const selectedCategories = Array.from(checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.id);

    if (title.length > 250) {
        document.getElementById('title-error').textContent = 'Maximum 255 characters.';
        isValid = false;
    }
    if (!title.trim()) {
        document.getElementById('title-error').textContent = 'Title is required.';
        isValid = false;
    }

    if (selectedCategories.length === 0) {
        document.getElementById('category-error').textContent = 'Please select at least one category.';
        isValid = false;
    }

    if (content.length > 5000) {
        document.getElementById('textarea-error').textContent = "Maximum 5000 characters.";
        isValid = false;
    }
    if (!content.trim()) {
        document.getElementById('textarea-error').textContent = 'content is required.';
        isValid = false;
    }
    if (isValid) {
        formContainer.classList.remove('expanded');
        postFormElement.classList.remove('active');
        const data = {
            title,
            content,
            categories: selectedCategories
        };
        document.querySelector('.form-input').value = "";
        document.getElementById('postContent').value = "";
        document.querySelectorAll('#category-list input[type="checkbox"]').forEach(el => el.checked = false);
        fetch("/api/createpost", {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data)
        }).then(response => {
            if (!response.ok) {
                errorPage(response.status)
                return
            }
            return response.json()
        })
            .then(newPost => {
                populatePosts([newPost], false)
            });
    }
}

function updateUserStatus(userID, isOnline) {
    const usernameElements = document.querySelectorAll(`.username[data-user-id="${userID}"]`);
    usernameElements.forEach(usernameElement => {
        if (isOnline) {
            usernameElement.classList.remove("offline");
            usernameElement.classList.add("online");

        } else {
            usernameElement.classList.remove("online");
            usernameElement.classList.add("offline");
        }
    });
}

function createMessagePopup(username, ReceiverID) {
    const popup = document.createElement('div');
    popup.className = `message-popup`;
    popup.innerHTML = `
        <div class="message-popup-content">
            <div class="message-header">
                <h3>${username}</h3>
                <button class="close-popup">&times;</button>
            </div>
            <div class="message-body">
                <div class="message-history">
                    <!-- Messages will be displayed here -->
                </div>
                <div class="message-input">
                    <textarea name="message-texterea" placeholder="Type your message..."></textarea>
                    <button class="send-message">Send</button>
                </div>
                <span class="err-message" id="message-error"></span>
            </div>
        </div>
    `;
    popup.setAttribute("data-user-name", username);
    let data = {
        senderID: getCookieByName("sessionId"),
        receiverID: ReceiverID,
        offset: 0,
        append: false,
    }

    getMessages(popup, data, ReceiverID);

    const closeButton = popup.querySelector('.close-popup');
    closeButton.addEventListener('click', () => {
        MarkAsRead(ReceiverID)
        document.body.removeChild(popup);
    });

    const sendButton = popup.querySelector('.send-message');
    const textarea = popup.querySelector('textarea');
    const messageHistory = popup.querySelector('.message-history');
    function userStoppedTyping() {
        observator = 0
        connectionToWS.send(JSON.stringify({ pimp: "Typing Stoped", id: ReceiverID, session: getCookieByName("sessionId") }));
    }
    textarea.addEventListener('input', () => {
        clearTimeout(typingTimer)

        if (observator === 0) {
            observator = 1
            connectionToWS.send(JSON.stringify({ pimp: "Typing In Progress", id: ReceiverID, session: getCookieByName("sessionId") }));
        }
        typingTimer = setTimeout(userStoppedTyping, 300);

    })

    sendButton.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey && observator === 0) {
            event.preventDefault();
            sendMessage();
        }
    });

    function sendMessage() {

        const message = textarea.value.trim();
        if (message.length > 5000) {
            document.getElementById('message-error').textContent = "Maximum 5000 characters.";
            return;
        }
        data.append = true;
        if (message) {
            const timestamp = getFormattedDateTime();
        // addMessage(username, loggeed,message, true, data.append, true, popup, timestamp);
            addMessage(username,loggeed, message, true, data.append, true, popup, timestamp);
            textarea.value = '';
            connectionToWS.send(JSON.stringify({ msg: message, session: getCookieByName("sessionId"), id: ReceiverID, date: timestamp }));
            MarkAsRead(ReceiverID);
            fetchUsers(0, false);
        }
    }

    messageHistory.addEventListener('scroll', debounce(() => {
        if (messageHistory.scrollTop === 0) {
            data.offset = document.querySelectorAll(".message").length;
            data.append = false;
            getMessages(popup, data, ReceiverID);
        }
    }, 300));

    document.body.appendChild(popup);
}

function getMessages(popup, data, ReceiverID) {
    const messageHistory = popup.querySelector('.message-history');
    fetch(`/api/getmessages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then((response) => {
        if (!response.ok) {
            errorPage(response.status)
            return
        }
        return response.json()
    })
        .then((messages) => {
            if (messages) {
                const scrollHeightBefore = messageHistory.scrollHeight;
                for (let i = 0; i < messages.length; i++) {
                    if (messages[i].ReceiverID !== ReceiverID) {
                        addMessage(messages[i].UserNameSender, messages[i].UserNameReceiver, messages[i].Content, false, data.append, false, popup, messages[i].FormattedDate);
                    } else {
                        addMessage(messages[i].UserNameReceiver, messages[i].UserNameSender, messages[i].Content, true, data.append, false, popup, messages[i].FormattedDate);
                    }
                }
                const scrollHeightAfter = messageHistory.scrollHeight;
                messageHistory.scrollTop = scrollHeightAfter - scrollHeightBefore;
            }
        })
}
function typingStopped(username) {
    const popup = document.querySelector(`.message-popup[data-user-name="${username}"]`);
    const progress = popup.querySelector('.progress');
    const messageHistory = popup.querySelector('.message-history');
    if (progress) messageHistory.removeChild(progress)
}
function typingInProgress(popup, userName, shouldScrollToBottom) {
    const messageHistory = popup.querySelector('.message-history');
    const typingElement = document.createElement('div');
    typingElement.className = "message progress"
    const contentElement = document.createElement('div');
    const usernameElement = document.createElement('div');
    usernameElement.className = 'message-username';
    usernameElement.textContent = userName;
    contentElement.className = 'typing-indicator';
    contentElement.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>`
    typingElement.appendChild(usernameElement)
    typingElement.appendChild(contentElement);
    messageHistory.appendChild(typingElement);
    if (shouldScrollToBottom) {
        messageHistory.scrollTop = messageHistory.scrollHeight;
    }

}

function addMessage(userNameSender, userNameReceiver, message, isMyMessage, append, shouldScrollToBottom, popup, timestamp) {
    const messageHistory = popup.querySelector('.message-history');
    const messageElement = document.createElement('div');
    messageElement.className = isMyMessage ? 'message my-message' : 'message other-message';
    const timestampElement = document.createElement('div');
    timestampElement.className = 'message-timestamp';
    const timeString = formatTimestamp(timestamp);
    timestampElement.textContent = timeString;
    const contentElement = document.createElement('div');
    const usernameElement = document.createElement('div');
    usernameElement.className = 'message-username';
    usernameElement.textContent = !isMyMessage ? userNameSender : userNameReceiver;
    const preElement = document.createElement('pre');
    preElement.className = "messagePre"
    contentElement.className = 'message-content';
    preElement.textContent = message

    contentElement.appendChild(preElement)
    messageElement.appendChild(usernameElement)
    messageElement.appendChild(contentElement);
    messageElement.appendChild(timestampElement);
    if (append) {
        messageHistory.appendChild(messageElement);
        if (shouldScrollToBottom) {
            messageHistory.scrollTop = messageHistory.scrollHeight;
        }
    } else {
        messageHistory.insertBefore(messageElement, messageHistory.firstChild);
    }
}

function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatTimestamp(timestamp) {
    const now = new Date();
    const messageDate = new Date(timestamp);
    if (
        messageDate.getDate() === now.getDate() &&
        messageDate.getMonth() === now.getMonth() &&
        messageDate.getFullYear() === now.getFullYear()
    ) {
        const hours = String(messageDate.getHours()).padStart(2, '0');
        const minutes = String(messageDate.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    } else {
        const year = messageDate.getFullYear();
        const month = String(messageDate.getMonth() + 1).padStart(2, '0');
        const day = String(messageDate.getDate()).padStart(2, '0');
        const hours = String(messageDate.getHours()).padStart(2, '0');
        const minutes = String(messageDate.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

export function getCookieByName(name) {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith(name + "=")) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

function getPosts(offset) {
    fetch(`/api/posts/${offset}`)
        .then((response) => {
            if (!response.ok) {
                errorPage(response.status)
                return
            }
            return response.json()
        })
        .then((data) => {
            if (!data) {
                stopLoading = true;
            } else {
                totalposts = data[0].TotalCount
                populatePosts(data, true);
                if (data.length === 20) {
                    stopLoading = false;
                } else {
                    stopLoading = true;
                }
            }
        })
}

function populatePosts(posts, append) {
    const feed = document.querySelector(".feed");
    if (posts && posts.length > 0) {
        posts.forEach((post) => {
            const postElement = document.createElement("div");
            postElement.className = "post";
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="user-info">
                        <h4>${post.Username}</h4>
                    </div>
                    <span class="timestamp">${post.FormattedDate}</span>
                </div>
                <div class="post-title">${post.Title}</div>
                <div class="post-categories">Categories: ${post.CategoryName}</div>
                <div class="post-content">
                    <pre>${post.Content}</pre>
                </div>
                <div class="post-footer">
                    <div class="actions">
                        <button class="like" data-post-id="${post.PostID}">${post.LikeCount} Like</button>
                        <button class="dislike" data-post-id="${post.PostID}">${post.DisLikeCount} Dislike</button>
                        <button class="toggle-comment" id=${post.PostID}>${post.CommentCount} Comment</button>
                    </div>
                </div>
                <div class="comment-section" style="display: none;">
                    <div class="comments"></div>
                    <button class="loadMore">Load More ...</button>
                    <div class="comment-form">
                        <textarea placeholder="Add a comment..." name="comment-texterea"></textarea>
                        <p id="err"></p>
                        <button class="submit-comment">Submit</button>
                    </div>
                </div>`;
            if (append) {
                feed.appendChild(postElement);
            } else {
                feed.insertBefore(postElement, feed.firstChild);
            }

            const toggleCommentButton = postElement.querySelector('.toggle-comment');
            const commentSection = postElement.querySelector('.comment-section');
            const loadMoreButton = postElement.querySelector('.loadMore');

            toggleCommentButton.addEventListener('click', () => {
                if (commentSection.style.display === 'none') {
                    commentSection.style.display = 'block';
                    if (!commentSection.dataset.loaded) {
                        loadComments(post.PostID, commentSection.querySelector('.comments'), 0, loadMoreButton);
                        commentSection.dataset.loaded = true;
                    }
                } else {
                    commentSection.style.display = 'none';
                }
            });

            loadMoreButton.addEventListener('click', () => {
                const currentOffset = parseInt(loadMoreButton.dataset.offset) || 0;
                const nextOffset = currentOffset + 5;
                loadComments(post.PostID, commentSection.querySelector('.comments'), nextOffset, loadMoreButton);
                loadMoreButton.dataset.offset = nextOffset;
            });

            const submitCommentButton = postElement.querySelector('.submit-comment');
            const commentTextarea = postElement.querySelector('.comment-form textarea');

            submitCommentButton.addEventListener('click', () => {
                const errParagraph = document.getElementById("err");
                errParagraph.textContent = "";
                const comment = commentTextarea.value.trim();
                if (comment) {
                    submitComment(post.PostID, comment, commentSection.querySelector('.comments'));
                    commentTextarea.value = '';
                } else {
                    errParagraph.textContent = "Invalid Comment";
                }
            });
            if (!append) {
                const likePostButton = document.querySelector(`.like[data-post-id="${post.PostID}"]`);
                const dislikePostButton = document.querySelector(`.dislike[data-post-id="${post.PostID}"]`);
                likePostButton.addEventListener('click', () => {
                    const postId = likePostButton.dataset.postId;
                    handleReact(postId, 'like', 'post');
                });

                dislikePostButton.addEventListener('click', () => {
                    const postId = dislikePostButton.dataset.postId;
                    handleReact(postId, 'dislike', 'post');
                });
            }
        });
        if (append) {
            setupReactionButtons();
        }
    } else {
        if (feed) {
            feed.innerHTML = `<div class="no-results">No Posts Found.</div>`;
        }
    }
}

function loadComments(postId, commentsContainer, offset = 0, loadMoreButton) {
    fetch(`/api/comment/${postId}/${offset}`)
        .then(response => {
            if (!response.ok) {
                errorPage(response.status)
                return
            }
            return response.json()
        })
        .then(comments => {
            if (!comments || comments.length === 0) {
                if (offset === 0) {
                    commentsContainer.innerHTML = '<p class="no-comment">No comments yet.</p>';
                }
                loadMoreButton.style.display = 'none';
            } else {
                if (offset === 0) {
                    commentsContainer.innerHTML = '';
                    comments.forEach(comment => {
                        const commentElement = commentCompenent(comment);
                        commentsContainer.appendChild(commentElement);
                    });
                } else {
                    comments.forEach(comment => {
                        const commentElement = commentCompenent(comment)
                        commentsContainer.appendChild(commentElement);
                    });
                }
                if (comments.length < 5 || comments[0].TotalCount <= offset + 5) {
                    loadMoreButton.style.display = 'none';
                } else if (comments[0].TotalCount > offset) {
                    loadMoreButton.style.display = 'block';
                }
            }
            setupCommentReactionButtons();
        })
}

function submitComment(postId, comment, commentsContainer) {
    if (comment.length > 5000) {
        document.getElementById('err').textContent = "Maximum 5000 characters.";
        return
    }
    const commentCountButton = document.getElementById(postId);
    fetch(`/api/sendcomment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment, postId: postId }),
    })
        .then(response => {
            if (!response.ok) {
                errorPage(response.status)
                return
            }
            return response.json()
        })
        .then(newComment => {
            const commentElement = commentCompenent(newComment);
            commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
            const noComment = commentsContainer.querySelector('.no-comment');
            if (noComment) commentsContainer.removeChild(noComment);
            const totalCount = newComment.TotalCount;
            commentCountButton.textContent = `${totalCount} Comment${totalCount !== 1 ? 's' : ''}`;
            const likeCommentButton = document.querySelector(`.like[data-comment-id="${newComment.CommentID}"]`);
            const dislikeCommentButton = document.querySelector(`.dislike[data-comment-id="${newComment.CommentID}"]`);
            likeCommentButton.addEventListener('click', () => {
                const commentId = likeCommentButton.dataset.commentId;
                handleReact(commentId, 'like', 'comment');
            });

            dislikeCommentButton.addEventListener('click', () => {
                const commentId = dislikeCommentButton.dataset.commentId;
                handleReact(commentId, 'dislike', 'comment');
            });
        })
}
function MarkAsRead(senderID) {
    fetch("/api/markAsRead", {
        method: "POST",
        body: JSON.stringify({ receiverID: getCookieByName("sessionId"), senderID: senderID })
    }).then(() => {
        const usernameElement = document.querySelector(`.username[data-user-id="${senderID}"]`);
        const img = usernameElement.querySelector(`.notify-msg`);
        if (img) usernameElement.removeChild(img)
    }

    )
}
function fetchUsers(offset, append = true) {
    fetch(`/api/users/${offset}`)
        .then(response => {
            if (!response.ok) {
                errorPage(response.status)
                return
            }
            return response.json()
        })
        .then(users => {
            const userList = document.querySelector('.user-list');
            const userCount = document.querySelectorAll(".username").length
            if (users.length > 0) {
                if (!append) {
                    userList.innerHTML = ""
                }
                users.forEach(user => {
                    const usernameElement = document.createElement('div');
                    usernameElement.classList.add('username');
                    usernameElement.classList.add('offline');
                    usernameElement.textContent = user.Username;
                    usernameElement.setAttribute("data-user-id", user.ID);
                    usernameElement.addEventListener('click', () => {

                        createMessagePopup(user.Username, user.ID);
                        MarkAsRead(user.ID)
                    });

                    userList.appendChild(usernameElement);
                });
            } else if (userCount === 0) {
                userList.innerHTML = ""
                const usernameElement = document.createElement('p');
                usernameElement.textContent = "You are the only user Invite your Friends ^_^"
                userList.appendChild(usernameElement);
            }


            fetch('/api/online-users')
                .then(response => response.json())
                .then(onlineUsers => {
                    onlineUsers.forEach(userID => {
                        updateUserStatus(userID, true);
                    });
                })
                .catch(error => {
                    console.error('Error fetching online users:', error);
                });
        }).then(() => {
            CheckUnreadMessage();
        })
        .catch(error => {
            console.error('Error fetching users:', error);
        });

}

function getUsers(searchTerm) {
    fetch(`/api/searchedusers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search: searchTerm }),
    })
        .then(response => response.json())
        .then(users => {
            const userList = document.querySelector('.user-list');
            if (users.length > 0) {
                userList.innerHTML = ""
                users.forEach(user => {
                    const usernameElement = document.createElement('div');
                    usernameElement.classList.add('username')
                    usernameElement.classList.add('offline')
                    usernameElement.textContent = user.Username;
                    usernameElement.setAttribute("data-user-id", user.ID);
                    usernameElement.addEventListener('click', () => {

                        createMessagePopup(user.Username, user.ID);
                        MarkAsRead(user.ID)
                    });

                    userList.appendChild(usernameElement);
                });
            } else {
                userList.innerHTML = ""
                const usernameElement = document.createElement('p');
                usernameElement.textContent = "User not found"
                userList.appendChild(usernameElement);
            }


            fetch('/api/online-users')
                .then(response => {
                    if (!response.ok) {
                        errorPage(response.status)
                        return
                    }
                    return response.json()
                })
                .then(onlineUsers => {
                    onlineUsers.forEach(userID => {
                        updateUserStatus(userID, true);
                    });
                })
        }).then(() => {
            CheckUnreadMessage();
        })
}

function getCategories() {
    fetch(`/api/categories`)
        .then((response) => {
            if (!response.ok) {
                errorPage(response.status)
                return
            }
            return response.json()
        })
        .then((data) => {
            populateCategories(data);
        })
}

function populateCategories(categories) {
    const categoryList = document.querySelector("fieldset");
    categoryList.innerHTML = categories
        .map(
            (category) => `
                <label class="control" for="${category.ID}">
                    <input type="checkbox" name="category" id="${category.ID}">
                    <span class="control__content">
                        <svg aria-hidden="true" focusable="false" width="30" height="30" viewBox="0 0 30 30" fill="none"><circle cx="15" cy="15" r="15" fill="#1E1B1D"></circle><path d="M10.78 21h1.73l.73-3.2h2.24l-.74 3.2h1.76l.72-3.2h3.3v-1.6H17.6l.54-2.4H21v-1.6h-2.5l.72-3.2h-1.73l-.73 3.2h-2.24l.74-3.2H13.5l-.73 3.2H9.5v1.6h2.93l-.56 2.4H9v1.6h2.52l-.74 3.2zm2.83-4.8l.54-2.4h2.24l-.54 2.4H13.6z" fill="#fff"></path></svg>
                        ${category.Name}
                    </span>
                </label>
            `
        )
        .join("");
}

window.addEventListener("scroll", debounce(() => {
    if (isLoading || totalposts < 20) return;

    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight && !stopLoading) {
        isLoading = true;

        const feed = document.querySelector('.feed');

        if (feed) {
            const placeholder = document.createElement('div');
            placeholder.className = 'post-placeholder';
            placeholder.innerHTML = `
                <div class="post-header">
                    <div class="user-info">
                        <h4 style="background: #e0e0e0; height: 20px; width: 100px; border-radius: 4px;"></h4>
                    </div>
                    <span class="timestamp" style="background: #e0e0e0; height: 16px; width: 120px; border-radius: 4px; display: inline-block;"></span>
                </div>
                <div class="post-title" style="background: #e0e0e0; height: 18px; width: 70%; margin: 10px 0; border-radius: 4px;"></div>
                <div class="post-categories" style="background: #e0e0e0; height: 14px; width: 50%; margin: 5px 0; border-radius: 4px;"></div>
                <div class="post-content" style="background: #e0e0e0; height: 40px; width: 100%; margin: 10px 0; border-radius: 4px;"></div>
                <div class="post-footer">
                    <div class="actions">
                        <button style="background: #e0e0e0; height: 16px; width: 60px; border-radius: 4px; border: none; margin-right: 10px;"></button>
                        <button style="background: #e0e0e0; height: 16px; width: 60px; border-radius: 4px; border: none; margin-right: 10px;"></button>
                        <button style="background: #e0e0e0; height: 16px; width: 80px; border-radius: 4px; border: none;"></button>
                    </div>
                </div>
            `;
            feed.appendChild(placeholder);
            window.scrollTo(0, document.body.scrollHeight);
            let posts = document.querySelectorAll(".post");

            setTimeout(() => {
                try {
                    getPosts(posts.length);
                } catch (error) {
                    NavigateTo("error")
                    console.error('Error fetching data:', error);
                } finally {
                    feed.removeChild(placeholder);
                    isLoading = false;
                }
            }, 1000);
        }
    }
}), 300);

function setupReactionButtons() {
    const likeButtons = document.querySelectorAll('.like[data-post-id]');
    const dislikeButtons = document.querySelectorAll('.dislike[data-post-id]');

    likeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const postId = button.dataset.postId;
            handleReact(postId, 'like', 'post');
        });
    });

    dislikeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const postId = button.dataset.postId;
            handleReact(postId, 'dislike', 'post');
        });
    });
}

function setupCommentReactionButtons() {
    const likeCommentButtons = document.querySelectorAll('.like[data-comment-id]');
    const dislikeCommentButtons = document.querySelectorAll('.dislike[data-comment-id]');

    likeCommentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const commentId = button.dataset.commentId;
            handleReact(commentId, 'like', 'comment');
        });
    });

    dislikeCommentButtons.forEach(button => {
        button.addEventListener('click', () => {
            const commentId = button.dataset.commentId;
            handleReact(commentId, 'dislike', 'comment');
        });
    });
}

function handleReact(targetId, type, targetType) {
    const data = {
        targetId: targetId,
        type: type,
        targetType: targetType,
    };
    fetch(`/api/reacts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (!response.ok) {
                errorPage(response.status)
                return
            }
            return response.json()
        })
        .then(data => {
            if (targetType === 'post') {
                const likeButton = document.querySelector(`.like[data-post-id="${targetId}"]`);
                const dislikeButton = document.querySelector(`.dislike[data-post-id="${targetId}"]`);
                likeButton.textContent = `${data.likeCount} Like`;
                dislikeButton.textContent = `${data.dislikeCount} Dislike`;
            } else if (targetType === 'comment') {
                const likeButton = document.querySelector(`.like[data-comment-id="${targetId}"]`);
                const dislikeButton = document.querySelector(`.dislike[data-comment-id="${targetId}"]`);
                likeButton.textContent = `${data.likeCount} Like`;
                dislikeButton.textContent = `${data.dislikeCount} Dislike`;
            }
        })
}
function commentCompenent(comment) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
        <div class="comment-header">
            <div class="user-info">
                <h4>${comment.Username}</h4>
            </div>
            <span class="timestamp">${comment.FormattedDate}</span>
        </div>
        <div class="comment-content"><pre>${comment.Content}</pre></div>
        <div class="actions">
            <button class="like" data-comment-id="${comment.CommentID}">${comment.LikeCount} Like</button>
            <button class="dislike" data-comment-id="${comment.CommentID}">${comment.DisLikeCount} Dislike</button>
        </div>
    `;
    return commentElement;
}