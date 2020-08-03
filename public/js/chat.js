$(document).ready(function(){
const socket = io()

// Elements
//const $messageForm = $("#message-form")
const $messageFormInput = $('#message-form>input')
const $messageFormButton = $('#message-form button')
 const $sendLocationButton = document.querySelector('#send-location')
 const $messages = document.querySelector('#messages')

// Templates
//const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    console.log($newMessage)
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
   // console.log(newMessageMargin)      //0
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //console.log(newMessageHeight)  //44
    // Visible height
    const visibleHeight = $messages.offsetHeight
    //console.log(visibleHeight)  //659

    // Height of messages container
    const containerHeight = $messages.scrollHeight
    console.log(containerHeight)  
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    console.log($messages.scrollTop)
    console.log(scrollOffset)

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message', (message) => {
    //console.log(message)
    // const html = Mustache.render(messageTemplate, {
    //     username: message.username,
    //     message: message.text,
    //     createdAt: moment(message.createdAt).format('h:mm a')
    // })
    // console.log(html)
    var div = $("<div>")
    var p = $("<p>")
    var span1 = $('<span>',{"class":"message__name"})
    var span2 = $('<span>',{"class":"message__meta"})
    span1.html(message.username).appendTo(p)
    span2.html(moment(message.createdAt).format('h:mm a')).appendTo(p)
   
    var p2 = $("<p>").html(message.text)
    p.appendTo(div)
    p2.appendTo(div)
   
    div.appendTo("#messages")

    
    // const html = $.parseHTML( 
    // <div class="message">
    //      <p>
    //        <span class="message__name">{message.username}</span>
    //        <span class="message__meta">{message.createdAt}</span>
    //      </p>
    //      <p>{message}</p>
    // </div>)

    autoscroll()
})


socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})


//1.submit form
$("#message-form").on('submit', function(event){
    event.preventDefault()

    $messageFormButton.attr('disabled', 'disabled') //防止多次发送

    const message = $messageFormInput.val()

    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttr('disabled')
        $messageFormInput.val('')
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })
})

$sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')  
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

});