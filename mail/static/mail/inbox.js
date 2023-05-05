document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // on submit of form send email and redirect to sent mailbox:
  document.querySelector('#compose-form').onsubmit = send_email;

  // By default, load the inbox
  load_mailbox('inbox');

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#detail-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //headings for table
  const headings = document.createElement('div')
  headings.innerHTML = `
  <br>
  <div class="list-group-item text-light bg-secondary h6 mb-0 rounded-0">
    <div class="row">
      <div class="col-4">From</div>
      <div class="col-4">Title</div>
      <div class="col-4">Time</div>
    </div>
  </div>`;
  document.querySelector('#emails-view').append(headings);

  // load emails - GET request to API
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    //loop through emails
    emails.forEach(email => {
      const element = document.createElement('div');
      element.classList.add('list-group-item');
      if (email.read === true) {
        element.classList.add('list-group-item-secondary');
      }
      element.innerHTML = `
        <div class="row">
          <div class="col-4">${email.sender}</div>
          <div class="col-4">${email.subject}</div>
          <div class="col-4">${email.timestamp}</div>
        </div>
      `;
      element.addEventListener('click', function() {
        console.log('this element has been clicked');
        show_email(email, mailbox);
        if (mailbox === 'inbox') {
          read_email(email);
        }
      });
      document.querySelector('#emails-view').append(element);
    });
  });
}


function show_email(email, mailbox) {
  /// show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'block';
  
  // get email
  fetch(`/emails/${email.id}`)
  .then(response => response.json())
  .then(single_email => {
    //display email
    document.querySelector('#detail-view').innerHTML = `
    <div class='list-group-item text-muted'>
      <p>From: ${single_email.sender}     Time: ${single_email.timestamp}<p>
      <h6>To: ${single_email.recipients}<h6>
      <h6>Subject: ${single_email.subject}<h6>
    </div>
    <div class='list-group-item text-muted'>
      <p>${single_email.body}<p>
    </div>
    <div id="archive" class='list-group-item text-muted'>
      <button class="btn btn-secondary" type="submit" >Archive</button>
    </div>
    <div id="unarchive" class='list-group-item text-muted'>
      <button class="btn btn-secondary" type="submit" >Unarchive</button>
    </div>
    `;

    //show archive button in inbox only
    if (mailbox === 'inbox') {
      document.querySelector('#archive').style.display = 'block';
    }
    else {
      document.querySelector('#archive').style.display = 'none';
    }
    //show unarchive button in archive only
    if(mailbox === 'archive') {
      document.querySelector('#unarchive').style.display = 'block';
    }
    else {
      document.querySelector('#unarchive').style.display = 'none';
    }
    
    //Change archive status on button click
    document.querySelector('#archive').addEventListener('click', () => archive(single_email, true));
    document.querySelector('#unarchive').addEventListener('click', () => archive(single_email, false));
   
  });
}

function archive(email, status) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: status
    })
  })
  // once email has been archived return to inbox
  load_mailbox('inbox');
}


function send_email(event) {

  event.preventDefault()

  // get values from form for recipients, subject, and body
  const recipient = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  //make a POST request to /emails, passing in values 
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      // once email is sent load users sent mailbox
      load_mailbox('sent');
  });

}

function read_email(email){
  console.log(email);
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

//create some changes to see if they will push