<section>
  <h2>Title</h2>
  <p>
    Lorem, ipsum dolor sit amet consectetur adipisicing elit. Reiciendis
    excepturi perspiciatis a officiis temporibus blanditiis dolore sapiente
    earum quo. Perspiciatis quae laborum, consectetur, nemo ullam quod
    doloremque nisi natus corrupti, blanditiis distinctio excepturi deserunt
    totam est itaque culpa cumque harum. Mollitia voluptas vero id adipisci
    eveniet nostrum, dolore, minus dolorem tenetur sit quisquam neque ad tempore
    eius earum nobis inventore fugiat iure quaerat, totam distinctio sint? Error
    magni minima, hic at a esse doloribus in modi dolor placeat excepturi?
    Voluptates amet hic iusto voluptatibus id error ipsam dolor ea repellendus,
    quos nam facere iste ipsum debitis itaque neque officia ex?
  </p>
  <h2>Title</h2>
  <p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Non assumenda, rem
    ea officia esse cumque, officiis tempora maiores ut ex porro aperiam,
    quaerat nesciunt quisquam molestiae? Non libero ad laboriosam totam
    architecto delectus iusto sequi sapiente, nulla, quae consequatur magnam
    omnis? Expedita sunt, possimus voluptate voluptatum quae unde similique
    facilis.
  </p>
</section>

<style lang="scss">
  h2 {
    display: flex;
    gap: 0.25em;
    align-items: center;
    margin: 0;

    &::before {
      width: 1.5rem;
      height: 1.5rem;
      content: "";
      background: radial-gradient(
        #0d3c77 10%,
        transparent 15%,
        transparent 50%,
        #0d3c77 55%,
        #0d3c77 60%,
        transparent 65%
      );
    }
  }

  p {
    padding-left: 0.7rem;
    margin: 0;
    margin-left: 0.7rem;
    border-left: 0.1rem solid #0d3c77;
  }
</style>
