document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  
  document.querySelector("#compose-form").addEventListener("submit", handle_submit);
});

function compose_email() {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function handle_submit(event) {
  event.preventDefault();
  const formElement = event.currentTarget;
  const formData = new FormData(formElement);

  console.log(formData);

  fetch('/emails', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        recipients: formData.get("recipients"),
        subject: formData.get("subject"),
        body: formData.get("body")
    })
  })
  .then(response => response.json())
  .then(result => {
      document.querySelector("#response-message").innerHTML = result? JSON.stringify(result): "Carregando...";
      if (result.message === "Email sent successfully.") {
        load_mailbox('inbox');
      }
      else {
        formElement.recipients.value = '';
        formElement.subject.value = '';
        formElement.body.value = '';
      }
  });
}
