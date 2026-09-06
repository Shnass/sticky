import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');
//lBNqnEXlOrWNToYAcpZwMAEjgmESXThnCcbldUOI
//https://www.discogs.com/seller/skiver/profile?sort=price,desc

if (!app) {
  throw new Error('Не знайдено елемент #app');
}

app.innerHTML = `
  <main>
    <h1>STICKYICKY</h1>
    <p>Стікери для твоїх платівок</p>

    <form id="discogs-form">
      <label for="token">Discogs token</label>
      <input
        id="token"
        name="token"
        type="password"
        required
      />

      <label for="discogs-url">
        Посилання на колекцію або магазин
      </label>
      <input
        id="discogs-url"
        name="discogsUrl"
        type="url"
        placeholder="https://www.discogs.com/user/username/collection"
        required
      />

      <button type="submit" id="form-submit">Почати</button>
    </form>

    <p id="status" role="status" aria-live="polite"></p>
  </main>
`;

const form = document.querySelector<HTMLFormElement>('#discogs-form');
const status = document.querySelector<HTMLParagraphElement>('#status');
const button = document.querySelector<HTMLButtonElement>('#form-submit');

if(!form || !status || !button){
  throw new Error('Some elements are abscent!');
}

form.addEventListener('submit', async(e)=>{
  e.preventDefault();

  button.disabled = true;
  status.innerText='В процесі...';

  const formData = new FormData(form);

  try{
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers:{
        'Content-Type':'application/json',
      },
      body: JSON.stringify({
        token: formData.get('token'),
        discogsUrl: formData.get('discogsUrl'),
      })
    })

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error ?? 'Помилка сервера.');
    }

    status.textContent = data.message;
  } catch (error) {
    status.textContent =
      error instanceof Error
        ? error.message
        : 'Не вдалося надіслати форму.';
  } finally {
    button.disabled = false;
  }

})