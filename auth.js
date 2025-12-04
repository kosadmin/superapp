<script>
async function checkSession(onSuccess) {
  const token = localStorage.getItem("session_token");
  if (!token) {
    alert("Bạn chưa đăng nhập!");
    window.location.href = "?page=login";
    return;
  }

  google.script.run
    .withSuccessHandler(function(res) {
      if (res.valid) {
        onSuccess(res.user);
      } else {
        alert("Session hết hạn");
        localStorage.removeItem("session_token");
        window.location.href = "?page=login";
      }
    })
    .validateSession(token);
}
</script>
