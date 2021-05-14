const express = require('express');
const router = express.Router();
const collection = require('../database').collection;
const cluster = require('../database').cluster;
const {isAuthenticated} = require('../helpers/auth');
const uuid = require('uuid')

router.get('/add', isAuthenticated, (req, res) => {
    res.render('notes/newnotes');
});

// create note
router.post('/add',isAuthenticated, async(request, response) => {
    if (!request.body.title && !request.body.content) {
      return response.status(401).send({ "message": "A `title` and `content` are required for each blog post" })
    } else if (!request.body.title || !request.body.content) {
      return response.status(401).send({ 
        "message": `A ${!request.body.title ? '`title`' : '`content`'} is required for each blog post`
      })
    }
    const uniqueId = uuid.v4()
    var blog = {
      "type": "note",
      "nid": uniqueId,
      "email": request.user.value.email,
      "title": request.body.title,
      "content": request.body.content,
      "timestamp": (new Date()).getTime()
    }
    collection.insert(uniqueId, blog)
      .then(() => {
        request.flash('message','Nota agregada');
        response.redirect('/notes/');
      })
      .catch((e) => response.status(500).send(e))
  })
  
  // get notes
  router.get('/',isAuthenticated, async (request, response) => {
    try {
        const query = `SELECT * FROM \`prototype\` WHERE type = 'note' AND email = $EMAIL;`
        const options = { parameters: { EMAIL: request.user.value.email } }
        await cluster.query(query, options)
          .then((result) => {
            showresult = result.rows;
            response.render('notes/notes',{ showresult });
          })
          .catch((e) => response.status(500).send(e))
      } catch (e) {
        console.error(e.message)
      }
  });

router.get('/edit/:nid',isAuthenticated, async(request,response) =>{
  try {
    const query = `SELECT * FROM \`prototype\` WHERE type = 'note' AND nid = $NID;`
    const options = { parameters: { NID: request.params.nid} }
    await cluster.query(query, options)
      .then((result) => {
        showresult = result.rows[0];
        response.render('notes/edit-notes',{showresult})
      })
      .catch((e) => response.status(500).send(e))
  } catch (e) {
    console.error(e.message)
  }
});

router.post('/edit/:nid',isAuthenticated, async(request,response) =>{
  const {title , content } = request.body;
  try {
    const query = `UPDATE \`prototype\` SET title=$TITLE WHERE type = 'note' AND nid = $NID;`
    const options = { parameters: { TITLE: title ,NID: request.params.nid} }
    await cluster.query(query, options);
    const query2 = `UPDATE \`prototype\` SET content=$CONTENT WHERE type = 'note' AND nid = $NID;`
    const options2 = { parameters: { CONTENT: content ,NID: request.params.nid} }
    await cluster.query(query2, options2);
    request.flash('message','Nota editada');
    response.redirect('/notes/');

  } catch (e) {
    console.error(e.message)
  }
});

router.get('/delete/:nid',isAuthenticated, async(request,response) =>{
  try {
    const query = `DELETE FROM \`prototype\` WHERE type = 'note' AND nid = $NID;`
    const options = { parameters: { NID: request.params.nid} }
    await cluster.query(query, options);
    request.flash('message','Nota eliminada');
    response.redirect('/notes/');

  } catch (e) {
    console.error(e.message)
  }
});

module.exports = router;