import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  FormGroup, ControlLabel, FormControl, Panel, ListGroup, ListGroupItem,
  ButtonToolbar, Button, Tooltip, OverlayTrigger, Tabs, Tab
} from 'react-bootstrap';
import Immutable from 'immutable';
// import StickyDiv from 'react-stickydiv';
import { unionBy } from 'lodash';

import Screen from './models/Screen';

import ElementCollectionLabels from './ElementCollectionLabels';
import ScreenWellplates from './ScreenWellplates';
import ScreenResearchPlans from './ScreenResearchPlans';
import QuillEditor from './QuillEditor';
import ScreenDetailsContainers from './ScreenDetailsContainers';
import ElementActions from './actions/ElementActions';
import DetailActions from './actions/DetailActions';
import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';
import PrintCodeButton from './common/PrintCodeButton';
import ConfirmClose from './common/ConfirmClose';
import ElementDetailSortTab from './ElementDetailSortTab';

export default class ScreenDetails extends Component {
  constructor(props) {
    super(props);
    const { screen } = props;
    this.state = {
      screen,
      activeTab: UIStore.getState().screen.activeTab,
      visible: Immutable.List(),
    };
    this.onUIStoreChange = this.onUIStoreChange.bind(this);
    this.onTabPositionChanged = this.onTabPositionChanged.bind(this);
  }

  componentDidMount() {
    UIStore.listen(this.onUIStoreChange);
  }

  componentWillReceiveProps(nextProps) {
    const { screen } = nextProps;
    this.setState({ screen });
  }

  componentWillUnmount() {
    UIStore.unlisten(this.onUIStoreChange);
  }

  onUIStoreChange(state) {
    if (state.screen.activeTab !== this.state.activeTab) {
      this.setState({
        activeTab: state.screen.activeTab
      });
    }
  }

  handleSubmit() {
    const { screen } = this.state;

    if (screen.isNew) {
      ElementActions.createScreen(screen);
    } else {
      ElementActions.updateScreen(screen);
    }
    if (screen.is_new) {
      const force = true;
      DetailActions.close(screen, force);
    }
  }

  handleInputChange(type, event) {
    const types = ['name', 'requirements', 'collaborator', 'conditions', 'result', 'description'];
    if (types.indexOf(type) !== -1) {
      const { screen } = this.state;
      const { value } = event.target;

      screen[type] = value;
      this.setState({ screen });
    }
  }

  handleScreenChanged(screen) {
    this.setState({ screen });
  }

  dropResearchPlan(researchPlan) {
    const { screen } = this.state;
    screen.research_plans = unionBy(screen.research_plans, [researchPlan], 'id');
    this.forceUpdate();
  }

  deleteResearchPlan(researchPlan) {
    const { screen } = this.state;
    const researchPlanIndex = screen.research_plans.indexOf(researchPlan);
    screen.research_plans.splice(researchPlanIndex, 1);

    this.setState({ screen });
  }

  dropWellplate(wellplate) {
    const { screen } = this.state;
    screen.wellplates = unionBy(screen.wellplates, [wellplate], 'id');
    this.forceUpdate();
  }

  deleteWellplate(wellplate) {
    const { screen } = this.state;
    const wellplateIndex = screen.wellplates.indexOf(wellplate);
    screen.wellplates.splice(wellplateIndex, 1);

    this.setState({ screen });
  }

  screenHeader(screen) {
    const saveBtnDisplay = screen.isEdited ? '' : 'none';
    const datetp = `Created at: ${screen.created_at} \n Updated at: ${screen.updated_at}`;

    return (
      <div>
        <OverlayTrigger placement="bottom" overlay={<Tooltip id="screenDatesx">{datetp}</Tooltip>}>
          <span>
            <i className="icon-screen" />
            &nbsp;<span>{screen.name}</span> &nbsp;
          </span>
        </OverlayTrigger>
        <ElementCollectionLabels element={screen} placement="right" />
        <ConfirmClose el={screen} />
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="saveScreen">Save Screen</Tooltip>}
        >
          <Button
            bsStyle="warning"
            bsSize="xsmall"
            className="button-right"
            onClick={() => this.handleSubmit()}
            style={{ display: saveBtnDisplay }}
          >
            <i className="fa fa-floppy-o " />
          </Button>
        </OverlayTrigger>
        <OverlayTrigger
          placement="bottom"
          overlay={<Tooltip id="fullSample">FullScreen</Tooltip>}
        >
          <Button
            bsStyle="info"
            bsSize="xsmall"
            className="button-right"
            onClick={() => this.props.toggleFullScreen()}
          >
            <i className="fa fa-expand" />
          </Button>
        </OverlayTrigger>
        <PrintCodeButton element={screen} />
      </div>
    );
  }

  propertiesFields(screen) {
    const {
      wellplates, name, collaborator, result, conditions, requirements, description
    } = screen;

    return (
      <ListGroup fill="true">
        <ListGroupItem>
          <table width="100%">
            <tbody>
              <tr>
                <td width="50%" className="padding-right">
                  <FormGroup>
                    <ControlLabel>Name</ControlLabel>
                    <FormControl
                      type="text"
                      value={name || ''}
                      onChange={event => this.handleInputChange('name', event)}
                      disabled={screen.isMethodDisabled('name')}
                    />
                  </FormGroup>
                </td>
                <td width="50%">
                  <FormGroup>
                    <ControlLabel>Collaborator</ControlLabel>
                    <FormControl
                      type="text"
                      value={collaborator || ''}
                      onChange={event => this.handleInputChange('collaborator', event)}
                      disabled={screen.isMethodDisabled('collaborator')}
                    />
                  </FormGroup>
                </td>
              </tr>
              <tr>
                <td className="padding-right">
                  <FormGroup>
                    <ControlLabel>Requirements</ControlLabel>
                    <FormControl
                      type="text"
                      value={requirements || ''}
                      onChange={event => this.handleInputChange('requirements', event)}
                      disabled={screen.isMethodDisabled('requirements')}
                    />
                  </FormGroup>
                </td>
                <td >
                  <FormGroup>
                    <ControlLabel>Conditions</ControlLabel>
                    <FormControl
                      type="text"
                      value={conditions || ''}
                      onChange={event => this.handleInputChange('conditions', event)}
                      disabled={screen.isMethodDisabled('conditions')}
                    />
                  </FormGroup>
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <FormGroup>
                    <ControlLabel>Result</ControlLabel>
                    <FormControl
                      type="text"
                      value={result || ''}
                      onChange={event => this.handleInputChange('result', event)}
                      disabled={screen.isMethodDisabled('result')}
                    />
                  </FormGroup>
                </td>
              </tr>
              <tr>
                <td colSpan="2">
                  <FormGroup>
                    <ControlLabel>Description</ControlLabel>
                    <QuillEditor
                      value={description}
                      onChange={event => this.handleInputChange('description', { target: { value: event } })}
                      disabled={screen.isMethodDisabled('description')}
                    />
                  </FormGroup>
                </td>
              </tr>
            </tbody>
          </table>
        </ListGroupItem>
        <ListGroupItem>
          <h4 className="list-group-item-heading">Wellplates</h4>
          <ScreenWellplates
            wellplates={wellplates}
            dropWellplate={wellplate => this.dropWellplate(wellplate)}
            deleteWellplate={wellplate => this.deleteWellplate(wellplate)}
          />
        </ListGroupItem>
      </ListGroup>
    );
  }

  handleSelect(eventKey) {
    UIActions.selectTab({ tabKey: eventKey, type: 'screen' });
    this.setState({
      activeTab: eventKey
    });
  }

  onTabPositionChanged(visible) {
    this.setState({ visible });
  }

  render() {
    const { screen, visible } = this.state;

    const submitLabel = screen.isNew ? 'Create' : 'Save';

    const tabContentsMap = {
      properties: (
        <Tab eventKey="properties" title="Properties" key={`properties_${screen.id}`}>
          {this.propertiesFields(screen)}
        </Tab>
      ),
      analyses: (
        <Tab eventKey="analyses" title="Analyses" key={`analyses_${screen.id}`}>
          <ScreenDetailsContainers
            screen={screen}
            parent={this}
          />
        </Tab>
      ),
      researchPlans: (
        <Tab eventKey="researchPlans" title="Research Plans" key={`analyses_${screen.id}`}>
          <ScreenResearchPlans
            researchPlans={screen.research_plans}
            dropResearchPlan={researchPlan => this.dropResearchPlan(researchPlan)}
            deleteResearchPlan={researchPlan => this.deleteResearchPlan(researchPlan)}
          />
        </Tab>
      )
    };

    const tabTitlesMap = {
    };

    const tabContents = [];
    visible.forEach((value) => {
      const tabContent = tabContentsMap[value];
      if (tabContent) { tabContents.push(tabContent); }
    });

    const activeTab = (this.state.activeTab !== 0 && this.state.activeTab) || visible[0];

    return (
      <Panel
        bsStyle={screen.isPendingToSave ? 'info' : 'primary'}
        className="eln-panel-detail"
      >
        <Panel.Heading>{this.screenHeader(screen)}</Panel.Heading>
        <Panel.Body>
          <ElementDetailSortTab
            type="screen"
            availableTabs={Object.keys(tabContentsMap)}
            tabTitles={tabTitlesMap}
            onTabPositionChanged={this.onTabPositionChanged}
          />
          <Tabs activeKey={activeTab} onSelect={key => this.handleSelect(key)} id="screen-detail-tab">
            {tabContents}
          </Tabs>
          <ButtonToolbar>
            <Button bsStyle="primary" onClick={() => DetailActions.close(screen)}>Close</Button>
            <Button bsStyle="warning" onClick={() => this.handleSubmit()}>{submitLabel}</Button>
          </ButtonToolbar>
        </Panel.Body>
      </Panel>
    );
  }
}

ScreenDetails.propTypes = {
  screen: PropTypes.instanceOf(Screen).isRequired,
  toggleFullScreen: PropTypes.func.isRequired,
};
