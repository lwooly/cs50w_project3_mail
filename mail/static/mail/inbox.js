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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //headings for table
  const headings = document.createElement('div')
  headings.innerHTML = `
  <br>
  <div class="container no-gutters m-0">
    <div class="row text-light bg-secondary h6">
      <div class="col-4 border">From</div>
      <div class="col-4 border">Title</div>
      <div class="col-4 border">Time</div>
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
      element.innerHTML = `
      <div class="container no-gutters m-0">
        <div class="row border">
          <div class="col-4 border">${email.sender}</div>
          <div class="col-4 border">${email.subject}</div>
          <div class="col-4 border">${email.timestamp}</div>
        </div>
      </div>`;
      document.querySelector('#emails-view').append(element);
    });
  });
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