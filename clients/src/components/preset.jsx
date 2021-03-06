import React, { useState } from 'react'
import './preset.css'
import { Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap'
import Playlist from './playlist'
import NewPlaylist from './newPlaylist'
import EditPreset from './editPreset'

class Preset extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        access_token: '',
        refresh_token: '',
        edit: false,
        listening: false
      }
    }

    componentDidMount () {
      console.log("loaded")
     // console.log(process.env.REACT_APP_SPOTIFY_CLIENT_ID)
     // console.log(process.env.REACT_APP_SPOTIFY_CLIENT_SECRET)
    }

    render = () => {
      const ErrorAlert = () => {
        if(!this.props.isPremium) {
          return (
            <Alert variant="danger">
              <Alert.Heading>You do not have Spotify Premium</Alert.Heading>
                <div>
                  You cannot start a station without premium.
                </div>
            </Alert>
          )
        } else if (!this.props.listening) {
          return (
            <Alert variant="danger">
              <Alert.Heading>Cannot find Spotify Session</Alert.Heading>
                <div>
                  Start listening to something on Spotify to resolve this issue.
                </div>
            </Alert>
          )
        } else {
          return null
        }
      }

      function DeletePreset(props) {
        const [show, setShow] = useState(false);
      
        const handleClose = () => {
          setShow(false);
        }

        const handleDelete = () => {
          setShow(false);
          props.clickDelete();
        }
        const handleShow = () => setShow(true);

        return (
          <>
            <Button id = "deletebutton" variant= "dark" size= "sm" onClick={handleShow}>Delete Station</Button>{' '}
      
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Delete Station</Modal.Title>
              </Modal.Header>
              <Modal.Body>Are you sure you want to delete this station?</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="dark" onClick={handleDelete}>
                  Delete Station
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        );
      }

      const EditWeightsModal = (props) => {
        var pls = props.data.playlists
        var totalWeight = 0
        
        for(var i = 0; i< pls.length; i++) {
          totalWeight = totalWeight + pls[i].weight
        }
        
        const [show, setShow] = useState(false);
        const [weights, setWeight] = useState(pls);
        const [total, setTotal] = useState(totalWeight);
        const [showError, setError] = useState(false);

        const playlists = pls.map((pl, i) => 
        <div key={pl.playlistID}> 
          <Row id = "ewrow">
            <Col>
            <strong>{pl.playlistName}</strong>
              <Form.Control key = {i} id = "wbox" type="number" min = "0" max = "10000" size="sm" defaultValue={pl.weight} 
              onChange={e => {
                console.log(e.target.value)
                if(e.target.value === "") {
                  weights[i].weight = 0
                } else if(e.target.value < 0) {
                  weights[i].weight = 0
                } else {
                  weights[i].weight = parseInt(e.target.value, 10)
                }
                setWeight(...[weights])
                var tWC = 0
                for(var j = 0; j< weights.length; j++) {
                  tWC = tWC + weights[j].weight
                }
                setTotal(tWC)
                
                console.log(weights)
              }}/>
            </Col>
          </Row>
        </div>
        );

        const handleShow = () => {
          setShow(!show)
        } 

        const handleClose = () => {
          setWeight(props.data.playlists)
          setShow(!show);
        }

        const removeAlert = () => {
          setError(false)
        }

        const handleSubmit = () => {
          var valid = false
          for(var i = 0; i< pls.length; i++) {
            totalWeight = totalWeight + pls[i].weight
          }

          if(false) {
            setError(true)
          } else {
            var ps = this.props.data
            ps.playlists = weights
            console.log(ps)
            props.editWeights(ps)
            setShow(false);
          }
        }

        return (
          <>
            <Button id = "weights" variant= "dark" size= "sm" onClick={handleShow}>Edit Playlist Weights</Button>{' '}
      
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Modify Playlist Weights</Modal.Title>
              </Modal.Header>
              <Modal.Body id = "eplbody">
                <div id = "wdesc">
                  A playlist weight is the chance a song from that playlist will be queued when a song is queued. If the total weights add to 100, each number will be a percent, however each number is weighted against each other, so it don't have to add up to 100. For example, if you wanted more precision, you could use 1000 instead. It is recomended that your weights add to 100.
                </div>
                <hr></hr>
                {props.data.playlists.length < 1 ? <div>This station has no playlists</div> : playlists}
              </Modal.Body>
              <div>
                <hr></hr>
                <div id = "total">Total</div>
                <div id = "totalnum">{total}</div>
                {showError ? 
                  <Alert id = "ewalert" variant="danger" onClose={removeAlert} dismissible>
                    Each weight must be an integer greater than 0
                  </Alert>
                  : null
                }
              </div>
              <Modal.Footer>
                <Button id = "margin" variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button id = "margin" variant="dark" onClick={handleSubmit} disabled = {props.data.playlists.length < 1}>
                  Update
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        );
      }

      const StartShuffleModal = (props) => {

        const [show, setShow] = useState(false);
        const [numQueue, setQueue] = useState(5);
        const [interval, setInterval] = useState(3);
        const [errorMessage, setEM] = useState("")
        const [showError, showErrorMessage] = useState(false)

        const handleClose = () => {
          setShow(!show);
          showErrorMessage(false)
        }

        const handleSubmit = () => {
          if (numQueue > 10 || numQueue < 0) {
            setEM("Number of songs to queue must be an integer between 0 and 10")
            showErrorMessage(true)
          } else if (parseInt(numQueue) !== parseFloat(numQueue)){
            setEM("Number of songs to queue must be an integer")
            showErrorMessage(true)
          } else if(interval < 2) {
            setEM("Queue interval must be no less than 2 minutes")
            showErrorMessage(true)
          } else {
            setShow(false);
            props.startShuffling(this.props.data.presetId, this.props.data.presetName, parseInt(numQueue), interval);
          }          
        }

        const handleShow = () => {
          setShow(!show)
        } 

        const handleQueueChange = (event) => {
          setQueue(event.target.value)
        }

        const handleIntervalChange = (event) => {
          setInterval(parseFloat(event.target.value))
        }        

        const removeAlert = () => {
          showErrorMessage(false)
        }

        return (
          <>
            <Button id = "button" variant= "dark" size= "sm" onClick={handleShow} disabled = {this.props.curStation}>Start Shuffling!</Button>{' '}
      
            <Modal show={show} onHide={handleClose}>
              <Modal.Header closeButton>
                <Modal.Title>Start {this.props.data.presetName}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ErrorAlert></ErrorAlert>
                <Form.Group controlId="startcontrols">
                  <Form.Label><strong>Queue Songs on Startup</strong></Form.Label>
                  <Form.Control type="number" size="sm" min="0" max ="10" placeholder="5" defaultValue="5" onChange={handleQueueChange}/>
                  <Form.Text>
                    The more songs you queue, the more you can skip without running out of songs in queue. If you skip songs using the in-site skip button, a song will be queued automatically so the number you intially queue doesn't matter as much.
                  </Form.Text>
                  <br></br>
                  <Form.Label><strong>Queue Interval</strong></Form.Label>
                  <Form.Control type="number" size="sm" min="2" max ="60" placeholder="3" defaultValue="3" onChange={handleIntervalChange}/>
                  <Form.Text>
                      SmartShuffle will automatically queue a new song every X minutes. For seamless listening, select a value close to the average song length of songs in the station.
                  </Form.Text>
                </Form.Group>
                {showError ? 
                      <Alert variant="danger" onClose={removeAlert} dismissible>
                        {errorMessage}
                      </Alert>
                      : null
                }
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                  Cancel
                </Button>
                <Button variant="dark" onClick={handleSubmit} disabled = {!this.props.isPremium || !this.props.listening || showError}>
                  Start Shuffling!
                </Button>
              </Modal.Footer>
            </Modal>
          </>
        );
      }

      var pls = this.props.data.playlists
      const playlists = pls.map((pl) => 
      <div key={pl.playlistID}> 
        <Playlist 
          data = {pl}
          access_token = {this.props.access_token}
          refresh_token = {this.props.refresh_token}
          getUserPageInfo = {this.props.getUserPageInfo}
          deletePlaylist = {this.props.deletePlaylist}
          editPlaylist = {this.props.editPlaylist}
          getAccessToken = {this.props.getAccessToken}
        />
      </div>
      );

      if(this.state.edit) {
        return (
          <EditPreset
            access_token = {this.props.access_token}
            refresh_token = {this.props.refresh_token}
            data = {this.props.data}
            name = {this.props.data.presetName}
            repeatLimit = {this.props.data.repeatLimit}
            getUserPageInfo = {this.props.getUserPageInfo}
            clickEdit = {this.clickEdit}
            editPreset = {this.props.editPreset}
            getAccessToken = {this.props.getAccessToken}
          />
        )
      }

        return (
          <div id = "preset">
            <div id = "pname"> {this.props.data.presetName} </div>
            <StartShuffleModal 
              startShuffling = {this.props.startShuffling}>
            </StartShuffleModal>
            <div id = "rlimit"> Repeat Limit: {this.props.data.repeatLimit} </div>
            <div id = "playlists">
              {playlists}
              <NewPlaylist
                access_token = {this.props.access_token}
                refresh_token = {this.props.refresh_token}
                data = {this.props.data}
                getUserPageInfo = {this.props.getUserPageInfo}
                addNewPlaylist = {this.props.addNewPlaylist}
                getAccessToken = {this.props.getAccessToken}
               />
            </div>
            <div>
              <EditWeightsModal
                data = {this.props.data}
                editWeights = {this.editWeights}
              />
              <DeletePreset clickDelete={this.clickDelete}></DeletePreset>
              <Button id = "editbutton" variant= "dark" size= "sm" onClick={() => this.clickEdit()}>Edit Station</Button>{' '}
            </div>
          </div>
        )
    }

    clickShuffle = () => {
      console.log("clicked")
      this.props.startShuffling(this.props.data.presetId, this.props.data.presetName);
    }

    clickDelete = () => {
      this.deletePreset();
    }

    clickEdit = () => {
      this.setState({
        edit: !this.state.edit
      })
    }

    deletePreset = () => { 
      setTimeout(() => {
        var url = "https://shuffle.cahillaw.me/v1/presets/" + this.props.data.presetId
        fetch(url, {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.props.access_token 
          }
        })
        .then((response) => {
          if (response.status === 200) {
            console.log("deleted")
            this.props.deletePreset(this.props.data.presetId)
          } else if (response.status === 401) {
            console.log("access token is bad, getting new one...")
            this.props.getAccessToken(this.deletePreset)
          }
        })
      }, 0)
    }

    editWeights = (pldata) => {
      setTimeout(() => {
        var url = "https://shuffle.cahillaw.me/v1/updateplaylists/" + this.props.data.presetId
        fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.props.access_token 
          },
          body: JSON.stringify(pldata)
        })
        .then((response) => {
          if (response.status === 200) {
            response.json().then((data) => {
              this.props.editPlaylists(data)
            })
          } else if (response.status === 401) {
            console.log("access token is bad, getting new one...")
            this.props.getAccessToken(this.deletePreset)
          }
        })
      }, 0)
    }
    
}

export default Preset